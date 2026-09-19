import { useEffect, useRef, useMemo, useCallback } from "react";
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector2,
  Vector3,
  Color,
} from "three";

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

// Lightweight 2D layered snow. A handful of parallax layers, each sampling a
// grid where some cells hold a soft, anti-aliased flake. No raymarching, no
// per-pixel loops — round (smooth) flakes that are far cheaper than the old
// volumetric raymarch shader.
const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGamma;
uniform float uDensity;     // 0..1 fraction of cells that hold a flake
uniform float uSpeed;       // fall speed
uniform float uDirection;   // wind direction (radians)
uniform float uFlakeSize;   // base flake radius (cell units)
uniform float uVariant;     // 0 = square, 1 = round

const int LAYERS = 5;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void main() {
  // Aspect-correct, square cells.
  vec2 uv = gl_FragCoord.xy / uResolution.y;

  float t = uTime * uSpeed;
  float drift = cos(uDirection);

  float acc = 0.0;
  for (int i = 0; i < LAYERS; i++) {
    float fi = float(i);
    float depth = (fi + 1.0) / float(LAYERS); // 0.2 (near) .. 1.0 (far)

    float scale = mix(8.0, 22.0, depth);      // far = more, smaller flakes
    float fall  = mix(1.0, 0.45, depth);      // near falls faster (parallax)
    float fade  = mix(1.0, 0.4, depth);       // far layers dimmer

    // Falling + wind drift + gentle sway.
    vec2 g = uv * scale;
    g.y += t * fall;
    g.x += drift * t * fall * 0.5;
    g.x += sin(t * 0.6 + fi * 1.7) * 0.15;

    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;

    float rnd = hash21(id + fi * 19.3);
    float present = step(rnd, uDensity);

    // Jitter the flake within its cell.
    vec2 off = (vec2(hash21(id + 3.7), hash21(id + 8.1)) - 0.5) * 0.6;
    vec2 d = f - off;

    float r = uFlakeSize * (0.5 + rnd); // per-flake size variation
    float dist = uVariant < 0.5 ? max(abs(d.x), abs(d.y)) : length(d);

    // Resolution-aware anti-aliasing (no derivative extension needed).
    float aa = 1.5 * scale / uResolution.y;
    float flake = smoothstep(r, r - aa, dist);

    float twinkle = 0.75 + 0.25 * sin(t * 0.5 + rnd * 6.2831853);

    acc += flake * present * fade * twinkle;
  }

  float a = pow(clamp(acc * uBrightness, 0.0, 1.0), uGamma);
  gl_FragColor = vec4(uColor, a);
}
`;

interface PixelSnowProps {
  color?: string;
  /** Base flake radius in cell units. */
  flakeSize?: number;
  /** Fall speed. */
  speed?: number;
  /** Fraction of grid cells that hold a flake (0..1). */
  density?: number;
  /** Wind direction in degrees. */
  direction?: number;
  /** Overall opacity multiplier. */
  brightness?: number;
  /** Alpha falloff (1 = linear). */
  gamma?: number;
  variant?: "square" | "round";
  className?: string;
  style?: React.CSSProperties;
}

export default function PixelSnow({
  color = "#ffffff",
  flakeSize = 0.18,
  speed = 1,
  density = 0.4,
  direction = 125,
  brightness = 1,
  gamma = 1,
  variant = "round",
  className = "",
  style = {},
}: PixelSnowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const resizeTimeoutRef = useRef<any>(null);

  const getWindow = () =>
    typeof globalThis !== "undefined" && (globalThis as any).window
      ? ((globalThis as any).window as any)
      : undefined;

  const variantValue = useMemo(() => {
    return variant === "round" ? 1.0 : 0.0;
  }, [variant]);

  const colorVector = useMemo(() => {
    const threeColor = new Color(color);
    return new Vector3(threeColor.r, threeColor.g, threeColor.b);
  }, [color]);

  const handleResize = useCallback(() => {
    const win = getWindow();
    if (resizeTimeoutRef.current && win?.clearTimeout) {
      win.clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = win?.setTimeout
      ? (win.setTimeout(() => {
          const container = containerRef.current as any;
          const renderer = rendererRef.current;
          const material = materialRef.current;
          if (!container || !renderer || !material) return;

          const w = container.offsetWidth ?? 0;
          const h = container.offsetHeight ?? 0;
          renderer.setSize(w, h);
          material.uniforms.uResolution.value.set(w, h);
        }, 100) as number)
      : null;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const win = getWindow();
    if (!win) return;

    const Observer = win.IntersectionObserver as any;
    if (!Observer) return;

    const observer = new Observer(
      ([entry]: any[]) => {
        isVisibleRef.current = !!entry?.isIntersecting;
      },
      { threshold: 0 }
    );

    observer.observe(container);
    return () => observer.disconnect?.();
  }, []);

  useEffect(() => {
    const container = containerRef.current as any;
    const win = getWindow();
    if (!container || !win) return;

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        antialias: false,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: false,
      });
    } catch (err) {
      // No WebGL context (GPU-blocklisted or headless browsers, WebGL turned
      // off): the snow is decorative, so skip it instead of crashing the page.
      console.warn("[PixelSnow] WebGL unavailable, skipping effect:", err);
      return;
    }

    renderer.setPixelRatio(Math.min(win.devicePixelRatio || 1, 2));
    renderer.setSize(container.offsetWidth ?? 0, container.offsetHeight ?? 0);
    renderer.setClearColor(0x000000, 0);
    container.appendChild?.(renderer.domElement);
    rendererRef.current = renderer;

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Vector2(container.offsetWidth, container.offsetHeight),
        },
        uColor: { value: colorVector.clone() },
        uBrightness: { value: brightness },
        uGamma: { value: gamma },
        uDensity: { value: density },
        uSpeed: { value: speed },
        uDirection: { value: (direction * Math.PI) / 180 },
        uFlakeSize: { value: flakeSize },
        uVariant: { value: variantValue },
      },
      transparent: true,
    });
    materialRef.current = material;

    const geometry = new PlaneGeometry(2, 2);
    scene.add(new Mesh(geometry, material));

    win.addEventListener?.("resize", handleResize);

    const startTime = win.performance?.now ? win.performance.now() : Date.now();
    const requestFrame: any =
      win.requestAnimationFrame ??
      ((cb: any) => setTimeout(() => cb(Date.now()), 16));
    const cancelFrame: any =
      win.cancelAnimationFrame ?? ((id: any) => clearTimeout(id));

    const animate = () => {
      animationRef.current = requestFrame(animate) as any;

      if (isVisibleRef.current) {
        const now = win.performance?.now ? win.performance.now() : Date.now();
        material.uniforms.uTime.value = (now - startTime) * 0.001;
        renderer.render(scene, camera);
      }
    };
    animate();

    return () => {
      cancelFrame(animationRef.current as any);
      win.removeEventListener?.("resize", handleResize);
      if (resizeTimeoutRef.current && win.clearTimeout) {
        win.clearTimeout(resizeTimeoutRef.current);
      }
      if (container.contains?.(renderer.domElement)) {
        container.removeChild?.(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      rendererRef.current = null;
      materialRef.current = null;
    };
  }, [
    brightness,
    colorVector,
    density,
    direction,
    flakeSize,
    gamma,
    handleResize,
    speed,
    variantValue,
  ]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uBrightness.value = brightness;
    material.uniforms.uGamma.value = gamma;
    material.uniforms.uDensity.value = density;
    material.uniforms.uSpeed.value = speed;
    material.uniforms.uDirection.value = (direction * Math.PI) / 180;
    material.uniforms.uFlakeSize.value = flakeSize;
    material.uniforms.uVariant.value = variantValue;
    material.uniforms.uColor.value.copy(colorVector);
  }, [
    brightness,
    gamma,
    density,
    speed,
    direction,
    flakeSize,
    variantValue,
    colorVector,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
