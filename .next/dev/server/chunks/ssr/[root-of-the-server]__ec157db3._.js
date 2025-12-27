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
"[project]/Documents/GitHub/ThangBackend/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>IndexPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$PixelSnow$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/components/PixelSnow.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$FooterNav$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/components/FooterNav.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$PixelSnow$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$PixelSnow$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
function IndexPage() {
    const parallaxRef = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const handleScroll = ()=>{
            if (parallaxRef.current) {
                const scrolled = window.scrollY;
                parallaxRef.current.style.transform = `translate3d(0, ${scrolled * 0.2}px, 0)`;
            }
        };
        window.addEventListener("scroll", handleScroll);
        return ()=>window.removeEventListener("scroll", handleScroll);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.page,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.fxLayer,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$PixelSnow$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    color: "#ffffff",
                    flakeSize: 0.01,
                    minFlakeSize: 1.25,
                    pixelResolution: 200,
                    direction: 125,
                    brightness: 1,
                    variant: "snowflake",
                    style: {
                        opacity: 0.38
                    },
                    speed: 1.25,
                    density: 0.3
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.main,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                        style: styles.heroBanner,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                ref: parallaxRef,
                                style: styles.heroMediaFull
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.heroGradient
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.heroContentOverlay,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.kicker,
                                        children: "Action RPG • Multiplayer • Cross-platform"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 45,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                        style: styles.title,
                                        children: "Forge your legend in Thang"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 48,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.subtitle,
                                        children: "Dive into fast-paced battles, craft rare gear, and carve your path through a living world. Squad up with friends or conquer alone — the choice is yours."
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 49,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.ctaRow,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/download",
                                                style: {
                                                    ...styles.button,
                                                    ...styles.primary
                                                },
                                                children: "Download"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 55,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/learnmore",
                                                style: {
                                                    ...styles.button,
                                                    ...styles.secondary
                                                },
                                                children: "Learn more"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 61,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 54,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.platforms,
                                        children: "PC • Mac • Linux • Coming soon to Steam Deck"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 68,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                        style: styles.infoSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.infoHeader,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.kicker,
                                        children: "Why play"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 76,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                        style: styles.infoTitle,
                                        children: "Built for squads, tuned for skill"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 77,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.infoSubtitle,
                                        children: "Movement-cancel combos, reactive AI, and loot that respects your time. Thang rewards sharp play and keeps your squad synced across every platform."
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 78,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.infoGrid,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.infoCard,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                style: styles.infoCardTitle,
                                                children: "Combat depth"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 87,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: styles.infoText,
                                                children: "Parries, i-frame dodges, weapon stances, and ultimates that chain into co-op finishers."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 88,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 86,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.infoCard,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                style: styles.infoCardTitle,
                                                children: "Progression that lasts"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 94,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: styles.infoText,
                                                children: "Seasonal ladders without wipes on your core collection; cosmetics and builds travel with you."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 95,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 93,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.infoCard,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                style: styles.infoCardTitle,
                                                children: "Live world"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 101,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: styles.infoText,
                                                children: "Rotating events, faction wars, and dungeons that remix layouts each week."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 102,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 100,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                        style: styles.features,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.featureCard,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                        style: styles.featureTitle,
                                        children: "Skill-first combat"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 112,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.featureText,
                                        children: "Tight, timing-based battles with dodge-rolls, parries, and specials that reward mastery."
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 113,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.featureCard,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                        style: styles.featureTitle,
                                        children: "Co-op ready"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 119,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.featureText,
                                        children: "Jump in with friends, sync progress, and share loot via cross-platform play."
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 120,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 118,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.featureCard,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                        style: styles.featureTitle,
                                        children: "Evolving world"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 126,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.featureText,
                                        children: "Seasonal events, rotating dungeons, and a living economy that keeps the grind fresh."
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 127,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("section", {
                        style: styles.faqSection,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.infoHeader,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.kicker,
                                        children: "FAQ"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 136,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                        style: styles.infoTitle,
                                        children: "Answers before you drop in"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 137,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.faqGrid,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.faqItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                                style: styles.faqQuestion,
                                                children: "Is Thang free-to-play?"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 141,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: styles.faqAnswer,
                                                children: "Yes. Cosmetics are optional and progression is skill-earned, not paywalled."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 142,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 140,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.faqItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                                style: styles.faqQuestion,
                                                children: "Does it support cross-play?"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 148,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: styles.faqAnswer,
                                                children: "PC, Mac, and Linux play together today. Steam Deck optimizations are in flight."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 149,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 147,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.faqItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                                style: styles.faqQuestion,
                                                children: "Will my seasonal progress reset?"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 155,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: styles.faqAnswer,
                                                children: "Seasonal ladders reset rankings, but your core gear, cosmetics, and unlocks stay."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 158,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 154,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.faqItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h4", {
                                                style: styles.faqQuestion,
                                                children: "Can I solo the endgame?"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 164,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                style: styles.faqAnswer,
                                                children: "Yes, but squads clear faster. Boss mechanics scale for solo and co-op."
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                                lineNumber: 165,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                        lineNumber: 163,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                        lineNumber: 134,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.footerSpacer
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$components$2f$FooterNav$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/GitHub/ThangBackend/pages/index.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
const styles = {
    page: {
        background: "radial-gradient(circle at 20% 20%, rgba(31, 97, 255, 0.08), transparent 28%)," + "radial-gradient(circle at 80% 10%, rgba(118, 75, 162, 0.1), transparent 30%)," + "#0b0d10",
        minHeight: "100vh",
        padding: "0 20px 80px",
        color: "#e7e9ed",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
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
    heroBanner: {
        position: "relative",
        minHeight: "760px",
        overflow: "hidden",
        boxShadow: "0 30px 100px rgba(0,0,0,0.45)",
        margin: "0 auto 32px",
        maxWidth: "100%",
        width: "100%",
        isolation: "isolate",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    heroMediaFull: {
        position: "absolute",
        top: "-200px",
        bottom: "-200px",
        left: 0,
        right: 0,
        backgroundImage: "url('/ThangScreenshot.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        willChange: "transform",
        zIndex: 0
    },
    heroGradient: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(7,9,12,0.85) 0%, rgba(7,9,12,0.65) 40%, rgba(7,9,12,0.9) 100%)",
        backdropFilter: "blur(2px)",
        zIndex: 1
    },
    heroContentOverlay: {
        position: "relative",
        zIndex: 2,
        padding: "44px 32px 38px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "860px",
        width: "100%",
        color: "#f5f9ff",
        textShadow: "0 10px 30px rgba(0,0,0,0.55)",
        alignItems: "center",
        textAlign: "center",
        margin: "0 auto"
    },
    kicker: {
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontSize: "12px",
        color: "#d2ddff",
        margin: 0
    },
    title: {
        margin: 0,
        fontSize: "46px",
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        background: "linear-gradient(120deg, rgba(255,255,255,0.96), rgba(193,219,255,0.9), rgba(255,255,255,0.98))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        filter: "drop-shadow(0 14px 38px rgba(0,0,0,0.45))"
    },
    subtitle: {
        margin: 0,
        fontSize: "16px",
        lineHeight: 1.6,
        color: "#e2e7f3"
    },
    ctaRow: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginTop: "4px",
        justifyContent: "center"
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
    platforms: {
        marginTop: "4px",
        color: "#98a2b3",
        fontSize: "13px"
    },
    features: {
        maxWidth: "1100px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "24px",
        position: "relative",
        zIndex: 1,
        width: "100%",
        alignItems: "stretch",
        justifyItems: "stretch"
    },
    featureCard: {
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "8px",
        padding: "18px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        height: "100%"
    },
    featureTitle: {
        margin: "0 0 8px 0",
        fontSize: "16px",
        color: "#f5f7fb"
    },
    featureText: {
        margin: 0,
        color: "#c8cbd2",
        lineHeight: 1.5,
        fontSize: "14px"
    },
    infoSection: {
        maxWidth: "1100px",
        margin: "64px auto 24px",
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "18px"
    },
    infoHeader: {
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center"
    },
    infoTitle: {
        margin: 0,
        fontSize: "28px",
        letterSpacing: "-0.01em",
        color: "#f5f7fb"
    },
    infoSubtitle: {
        margin: 0,
        fontSize: "15px",
        color: "#c8cbd2",
        maxWidth: "960px",
        lineHeight: 1.6
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "24px",
        width: "100%",
        alignItems: "stretch",
        justifyItems: "stretch"
    },
    infoCard: {
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "10px",
        padding: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        height: "100%"
    },
    infoCardTitle: {
        margin: "0 0 8px 0",
        fontSize: "16px",
        color: "#f5f7fb"
    },
    infoText: {
        margin: 0,
        color: "#c8cbd2",
        lineHeight: 1.5,
        fontSize: "14px"
    },
    faqSection: {
        maxWidth: "1100px",
        margin: "72px auto 0",
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        width: "100%"
    },
    faqGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
        gap: "24px",
        width: "100%",
        alignItems: "stretch",
        justifyItems: "stretch"
    },
    faqItem: {
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "10px",
        padding: "14px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        width: "100%",
        height: "100%"
    },
    faqQuestion: {
        margin: "0 0 6px 0",
        fontSize: "15px",
        color: "#f5f7fb"
    },
    faqAnswer: {
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

//# sourceMappingURL=%5Broot-of-the-server%5D__ec157db3._.js.map