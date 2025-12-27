module.exports = [
"[project]/Documents/GitHub/ThangBackend/components/PixelSnow.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>PixelSnow
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__ = __turbopack_context__.i("[externals]/three [external] (three, esm_import, [project]/Documents/GitHub/ThangBackend/node_modules/three)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;
const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uFlakeSize;
uniform float uMinFlakeSize;
uniform float uPixelResolution;
uniform float uSpeed;
uniform float uDepthFade;
uniform float uFarPlane;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGamma;
uniform float uDensity;
uniform float uVariant;
uniform float uDirection;

// Precomputed constants
#define PI 3.14159265
#define PI_OVER_6 0.5235988
#define PI_OVER_3 1.0471976
#define INV_SQRT3 0.57735027
#define M1 1597334677U
#define M2 3812015801U
#define M3 3299493293U
#define F0 2.3283064e-10

// Optimized hash - inline multiplication
#define hash(n) (n * (n ^ (n >> 15)))
#define coord3(p) (uvec3(p).x * M1 ^ uvec3(p).y * M2 ^ uvec3(p).z * M3)

// Precomputed camera basis vectors (normalized vec3(1,1,1), vec3(1,0,-1))
const vec3 camK = vec3(0.57735027, 0.57735027, 0.57735027);
const vec3 camI = vec3(0.70710678, 0.0, -0.70710678);
const vec3 camJ = vec3(-0.40824829, 0.81649658, -0.40824829);

// Precomputed branch direction
const vec2 b1d = vec2(0.574, 0.819);

vec3 hash3(uint n) {
  uvec3 hashed = hash(n) * uvec3(1U, 511U, 262143U);
  return vec3(hashed) * F0;
}

float snowflakeDist(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x);
  a = abs(mod(a + PI_OVER_6, PI_OVER_3) - PI_OVER_6);
  vec2 q = r * vec2(cos(a), sin(a));
  float dMain = max(abs(q.y), max(-q.x, q.x - 1.0));
  float b1t = clamp(dot(q - vec2(0.4, 0.0), b1d), 0.0, 0.4);
  float dB1 = length(q - vec2(0.4, 0.0) - b1t * b1d);
  float b2t = clamp(dot(q - vec2(0.7, 0.0), b1d), 0.0, 0.25);
  float dB2 = length(q - vec2(0.7, 0.0) - b2t * b1d);
  return min(dMain, min(dB1, dB2)) * 10.0;
}

void main() {
  // Precompute reciprocals to avoid division
  float invPixelRes = 1.0 / uPixelResolution;
  float pixelSize = max(1.0, floor(0.5 + uResolution.x * invPixelRes));
  float invPixelSize = 1.0 / pixelSize;
  
  vec2 fragCoord = floor(gl_FragCoord.xy * invPixelSize);
  vec2 res = uResolution * invPixelSize;
  float invResX = 1.0 / res.x;

  vec3 ray = normalize(vec3((fragCoord - res * 0.5) * invResX, 1.0));
  ray = ray.x * camI + ray.y * camJ + ray.z * camK;

  // Precompute time-based values
  float timeSpeed = uTime * uSpeed;
  float windX = cos(uDirection) * 0.4;
  float windY = sin(uDirection) * 0.4;
  vec3 camPos = (windX * camI + windY * camJ + 0.1 * camK) * timeSpeed;
  vec3 pos = camPos;

  // Precompute ray reciprocal for strides
  vec3 absRay = max(abs(ray), vec3(0.001));
  vec3 strides = 1.0 / absRay;
  vec3 raySign = step(ray, vec3(0.0));
  vec3 phase = fract(pos) * strides;
  phase = mix(strides - phase, phase, raySign);

  // Precompute for intersection test
  float rayDotCamK = dot(ray, camK);
  float invRayDotCamK = 1.0 / rayDotCamK;
  float invDepthFade = 1.0 / uDepthFade;
  float halfInvResX = 0.5 * invResX;
  vec3 timeAnim = timeSpeed * 0.1 * vec3(7.0, 8.0, 5.0);

  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    if (t >= uFarPlane) break;
    
    vec3 fpos = floor(pos);
    uint cellCoord = coord3(fpos);
    float cellHash = hash3(cellCoord).x;

    if (cellHash < uDensity) {
      vec3 h = hash3(cellCoord);
      
      // Optimized flake position calculation
      vec3 sinArg1 = fpos.yzx * 0.073;
      vec3 sinArg2 = fpos.zxy * 0.27;
      vec3 flakePos = 0.5 - 0.5 * cos(4.0 * sin(sinArg1) + 4.0 * sin(sinArg2) + 2.0 * h + timeAnim);
      flakePos = flakePos * 0.8 + 0.1 + fpos;

      float toIntersection = dot(flakePos - pos, camK) * invRayDotCamK;
      
      if (toIntersection > 0.0) {
        vec3 testPos = pos + ray * toIntersection - flakePos;
        float testX = dot(testPos, camI);
        float testY = dot(testPos, camJ);
        vec2 testUV = abs(vec2(testX, testY));
        
        float depth = dot(flakePos - camPos, camK);
        float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * halfInvResX);
        
        // Avoid branching with step functions where possible
        float dist;
        if (uVariant < 0.5) {
          dist = max(testUV.x, testUV.y);
        } else if (uVariant < 1.5) {
          dist = length(testUV);
        } else {
          float invFlakeSize = 1.0 / flakeSize;
          dist = snowflakeDist(vec2(testX, testY) * invFlakeSize) * flakeSize;
        }

        if (dist < flakeSize) {
          float flakeSizeRatio = uFlakeSize / flakeSize;
          float intensity = exp2(-(t + toIntersection) * invDepthFade) *
                           min(1.0, flakeSizeRatio * flakeSizeRatio) * uBrightness;
          gl_FragColor = vec4(uColor * pow(vec3(intensity), vec3(uGamma)), 1.0);
          return;
        }
      }
    }

    float nextStep = min(min(phase.x, phase.y), phase.z);
    vec3 sel = step(phase, vec3(nextStep));
    phase = phase - nextStep + strides * sel;
    t += nextStep;
    pos = mix(pos + ray * nextStep, floor(pos + ray * nextStep + 0.5), sel);
  }

  gl_FragColor = vec4(0.0);
}
`;
function PixelSnow({ color = "#ffffff", flakeSize = 0.01, minFlakeSize = 1.25, pixelResolution = 200, speed = 1.25, depthFade = 8, farPlane = 20, brightness = 1, gamma = 0.4545, density = 0.3, variant = "square", direction = 125, className = "", style = {} }) {
    const containerRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const animationRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(0);
    const isVisibleRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(true);
    const rendererRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const materialRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const resizeTimeoutRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const getWindow = ()=>typeof globalThis !== "undefined" && globalThis.window ? globalThis.window : undefined;
    const variantValue = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>{
        return variant === "round" ? 1.0 : variant === "snowflake" ? 2.0 : 0.0;
    }, [
        variant
    ]);
    const colorVector = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>{
        const threeColor = new __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__["Color"](color);
        return new __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__["Vector3"](threeColor.r, threeColor.g, threeColor.b);
    }, [
        color
    ]);
    const handleResize = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useCallback"])(()=>{
        const win = getWindow();
        if (resizeTimeoutRef.current && win?.clearTimeout) {
            win.clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = win?.setTimeout ? win.setTimeout(()=>{
            const container = containerRef.current;
            const renderer = rendererRef.current;
            const material = materialRef.current;
            if (!container || !renderer || !material) return;
            const w = container.offsetWidth ?? 0;
            const h = container.offsetHeight ?? 0;
            renderer.setSize(w, h);
            material.uniforms.uResolution.value.set(w, h);
        }, 100) : null;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const container = containerRef.current;
        if (!container) return;
        const win = getWindow();
        if (!win) return;
        const Observer = win.IntersectionObserver;
        if (!Observer) return;
        const observer = new Observer(([entry])=>{
            isVisibleRef.current = !!entry?.isIntersecting;
        }, {
            threshold: 0
        });
        observer.observe(container);
        return ()=>observer.disconnect?.();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const container = containerRef.current;
        const win = getWindow();
        if (!container || !win) return;
        const scene = new __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__["Scene"]();
        const camera = new __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__["OrthographicCamera"](-1, 1, 1, -1, 0, 1);
        const renderer = new __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__["WebGLRenderer"]({
            antialias: false,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: false
        });
        renderer.setPixelRatio(Math.min(win.devicePixelRatio || 1, 2));
        renderer.setSize(container.offsetWidth ?? 0, container.offsetHeight ?? 0);
        renderer.setClearColor(0x000000, 0);
        container.appendChild?.(renderer.domElement);
        rendererRef.current = renderer;
        const material = new __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__["ShaderMaterial"]({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: {
                    value: 0
                },
                uResolution: {
                    value: new __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__["Vector2"](container.offsetWidth, container.offsetHeight)
                },
                uFlakeSize: {
                    value: flakeSize
                },
                uMinFlakeSize: {
                    value: minFlakeSize
                },
                uPixelResolution: {
                    value: pixelResolution
                },
                uSpeed: {
                    value: speed
                },
                uDepthFade: {
                    value: depthFade
                },
                uFarPlane: {
                    value: farPlane
                },
                uColor: {
                    value: colorVector.clone()
                },
                uBrightness: {
                    value: brightness
                },
                uGamma: {
                    value: gamma
                },
                uDensity: {
                    value: density
                },
                uVariant: {
                    value: variantValue
                },
                uDirection: {
                    value: direction * Math.PI / 180
                }
            },
            transparent: true
        });
        materialRef.current = material;
        const geometry = new __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__["PlaneGeometry"](2, 2);
        scene.add(new __TURBOPACK__imported__module__$5b$externals$5d2f$three__$5b$external$5d$__$28$three$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$three$29$__["Mesh"](geometry, material));
        win.addEventListener?.("resize", handleResize);
        const startTime = win.performance?.now ? win.performance.now() : Date.now();
        const requestFrame = win.requestAnimationFrame ?? ((cb)=>setTimeout(()=>cb(Date.now()), 16));
        const cancelFrame = win.cancelAnimationFrame ?? ((id)=>clearTimeout(id));
        const animate = ()=>{
            animationRef.current = requestFrame(animate);
            if (isVisibleRef.current) {
                const now = win.performance?.now ? win.performance.now() : Date.now();
                material.uniforms.uTime.value = (now - startTime) * 0.001;
                renderer.render(scene, camera);
            }
        };
        animate();
        return ()=>{
            cancelFrame(animationRef.current);
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
        depthFade,
        direction,
        farPlane,
        flakeSize,
        handleResize,
        minFlakeSize,
        pixelResolution,
        speed,
        variantValue
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const material = materialRef.current;
        if (!material) return;
        material.uniforms.uFlakeSize.value = flakeSize;
        material.uniforms.uMinFlakeSize.value = minFlakeSize;
        material.uniforms.uPixelResolution.value = pixelResolution;
        material.uniforms.uSpeed.value = speed;
        material.uniforms.uDepthFade.value = depthFade;
        material.uniforms.uFarPlane.value = farPlane;
        material.uniforms.uBrightness.value = brightness;
        material.uniforms.uGamma.value = gamma;
        material.uniforms.uDensity.value = density;
        material.uniforms.uVariant.value = variantValue;
        material.uniforms.uDirection.value = direction * Math.PI / 180;
        material.uniforms.uColor.value.copy(colorVector);
    }, [
        flakeSize,
        minFlakeSize,
        pixelResolution,
        speed,
        depthFade,
        farPlane,
        brightness,
        gamma,
        density,
        variantValue,
        direction,
        colorVector
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: className,
        style: {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            ...style
        }
    }, void 0, false, {
        fileName: "[project]/Documents/GitHub/ThangBackend/components/PixelSnow.tsx",
        lineNumber: 398,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FooterNav
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/node_modules/next/link.js [ssr] (ecmascript)");
;
;
const styles = {
    bar: {
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        borderTop: "1px solid #1e232d",
        padding: "24px 0 16px",
        position: "relative",
        zIndex: 1,
        background: "rgba(11,13,16,0.9)",
        backdropFilter: "blur(4px)"
    },
    inner: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        color: "#c8cbd2",
        fontSize: "14px"
    },
    brand: {
        fontWeight: 700,
        letterSpacing: "0.04em",
        color: "#f5f7fb"
    },
    links: {
        display: "flex",
        flexWrap: "wrap",
        gap: "14px"
    },
    link: {
        color: "#c8cbd2",
        textDecoration: "none",
        fontWeight: 600
    }
};
function FooterNav() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.bar,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: styles.inner,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.brand,
                    children: "Thang"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.links,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            style: styles.link,
                            children: "Home"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/download",
                            style: styles.link,
                            children: "Download"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/learnmore",
                            style: styles.link,
                            children: "Learn more"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/profile",
                            style: styles.link,
                            children: "Profile"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/login",
                            style: styles.link,
                            children: "Login"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx",
                    lineNumber: 49,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx",
            lineNumber: 47,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
}),
"[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>LearnMorePage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$PixelSnow$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/components/PixelSnow.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$FooterNav$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$PixelSnow$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$PixelSnow$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function LearnMorePage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.page,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.fxLayer,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$PixelSnow$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        color: "#ffffff",
                        flakeSize: 0.01,
                        minFlakeSize: 1.25,
                        pixelResolution: 200,
                        speed: 1.25,
                        density: 0.3,
                        direction: 125,
                        brightness: 1,
                        variant: "snowflake",
                        style: {
                            opacity: 0.34
                        }
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                        lineNumber: 9,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.fxMask
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.main,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.timelineSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.timelineHeader,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.kicker,
                                        children: "Roadmap"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                        lineNumber: 27,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                        style: styles.timelineTitle,
                                        children: "Road to launch"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                        lineNumber: 28,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.timelineSubtitle,
                                        children: "How we are sequencing development milestones through 2025."
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                        lineNumber: 29,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                lineNumber: 26,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.timelineList,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.timelineItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.timelineDot
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                lineNumber: 35,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.timelineContent,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.timelineLabel,
                                                        children: "Q1 2025"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 37,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                        style: styles.timelineStage,
                                                        children: "Development begins"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 38,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.timelineText,
                                                        children: "Core combat, movement, and foundational systems come online. Team builds tooling and pipelines."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 39,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                lineNumber: 36,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                        lineNumber: 34,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.timelineItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.timelineDot
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                lineNumber: 46,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.timelineContent,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.timelineLabel,
                                                        children: "Q2 2025"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 48,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                        style: styles.timelineStage,
                                                        children: "Vertical slice"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 49,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.timelineText,
                                                        children: "A polished demo showcasing combat, one dungeon, and core progression for feedback."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 50,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                lineNumber: 47,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                        lineNumber: 45,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.timelineItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.timelineDot
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                lineNumber: 57,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.timelineContent,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.timelineLabel,
                                                        children: "Q3 2025"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 59,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                        style: styles.timelineStage,
                                                        children: "Alpha"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 60,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.timelineText,
                                                        children: "Wider content drop, co-op sessions, and economy balancing with early community testers."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 61,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                lineNumber: 58,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                        lineNumber: 56,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.timelineItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.timelineDot
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                lineNumber: 68,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: styles.timelineContent,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.timelineLabel,
                                                        children: "Q4 2025"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 70,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                        style: styles.timelineStage,
                                                        children: "Beta"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 71,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                        style: styles.timelineText,
                                                        children: "Performance tuning, live events rehearsal, and final polish ahead of launch."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                        lineNumber: 72,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                                lineNumber: 69,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                        lineNumber: 67,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.footerSpacer
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$FooterNav$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/GitHub/ThangBackend/pages/learnmore.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
const styles = {
    page: {
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 20%, rgba(31, 97, 255, 0.08), transparent 28%)," + "radial-gradient(circle at 80% 10%, rgba(118, 75, 162, 0.1), transparent 30%)," + "#0b0d10",
        color: "#e7e9ed",
        padding: "40px 20px 80px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
    },
    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "0px"
    },
    fxLayer: {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0
    },
    fxMask: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(11,13,16,0.75) 0%, rgba(11,13,16,0.3) 40%, rgba(11,13,16,0.9) 100%)"
    },
    header: {
        maxWidth: "1100px",
        margin: "0 auto 28px",
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    kicker: {
        margin: 0,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontSize: "12px",
        color: "#d2ddff"
    },
    title: {
        margin: "6px 0 10px 0",
        fontSize: "32px",
        letterSpacing: "-0.02em"
    },
    subtitle: {
        margin: 0,
        color: "#c8cbd2",
        fontSize: "15px",
        lineHeight: 1.6
    },
    grid: {
        maxWidth: "1100px",
        margin: "24px auto 0",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "24px",
        position: "relative",
        zIndex: 1,
        alignItems: "stretch",
        justifyItems: "stretch"
    },
    card: {
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "10px",
        padding: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        height: "100%"
    },
    sectionTitle: {
        margin: "0 0 8px 0",
        fontSize: "18px"
    },
    sectionText: {
        margin: 0,
        color: "#c8cbd2",
        lineHeight: 1.5,
        fontSize: "14px"
    },
    list: {
        margin: "8px 0 0 18px",
        color: "#c8cbd2",
        lineHeight: 1.6,
        fontSize: "14px"
    },
    moreDevSection: {
        maxWidth: "1100px",
        margin: "22px auto 0",
        position: "relative",
        zIndex: 1
    },
    mediaCard: {
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "10px",
        padding: "16px",
        boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "18px",
        alignItems: "center"
    },
    videoFrame: {
        position: "relative",
        width: "100%",
        paddingBottom: "56.25%",
        overflow: "hidden",
        borderRadius: "10px",
        background: "#0d1015",
        border: "1px solid #1e232d"
    },
    iframe: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        borderRadius: "10px"
    },
    trailerCopy: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    trailerTitle: {
        margin: "0",
        fontSize: "22px",
        letterSpacing: "-0.01em",
        color: "#f5f7fb"
    },
    trailerSubtitle: {
        margin: 0,
        fontSize: "15px",
        color: "#c8cbd2",
        lineHeight: 1.6
    },
    trailerCtaRow: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginTop: "4px"
    },
    button: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 18px",
        borderRadius: "6px",
        fontWeight: 700,
        textDecoration: "none",
        fontSize: "14px",
        border: "1px solid transparent",
        transition: "transform 0.08s ease, background 0.15s ease, border-color 0.15s ease"
    },
    primary: {
        background: "#0f62fe",
        color: "#f5f7fb",
        borderColor: "#1f2a3a"
    },
    secondary: {
        background: "#11141a",
        color: "#f5f7fb",
        borderColor: "#1e232d"
    },
    timelineSection: {
        maxWidth: "1100px",
        margin: "28px auto 0",
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "10px",
        padding: "16px",
        boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
        position: "relative",
        zIndex: 1
    },
    timelineHeader: {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "14px",
        alignItems: "center"
    },
    timelineTitle: {
        margin: 0,
        fontSize: "22px",
        letterSpacing: "-0.01em",
        color: "#f5f7fb"
    },
    timelineSubtitle: {
        margin: 0,
        fontSize: "14px",
        color: "#c8cbd2",
        lineHeight: 1.5
    },
    timelineList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    timelineItem: {
        position: "relative",
        paddingLeft: "18px",
        marginLeft: "6px",
        borderLeft: "1px solid #1f2a3a"
    },
    timelineDot: {
        position: "absolute",
        left: "-7px",
        top: "6px",
        width: "12px",
        height: "12px",
        borderRadius: "999px",
        background: "#8aa2ff",
        border: "2px solid #0b0d10",
        boxShadow: "0 0 0 4px rgba(138,162,255,0.14)"
    },
    timelineContent: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    timelineLabel: {
        margin: 0,
        fontSize: "12px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#9bb1ff"
    },
    timelineStage: {
        margin: 0,
        fontSize: "16px",
        color: "#f5f7fb"
    },
    timelineText: {
        margin: 0,
        fontSize: "14px",
        color: "#c8cbd2",
        lineHeight: 1.5
    },
    footerSpacer: {
        height: "48px"
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8f673a21._.js.map