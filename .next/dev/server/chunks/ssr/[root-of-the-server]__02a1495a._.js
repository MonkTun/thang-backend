module.exports = [
"[project]/Documents/GitHub/ThangBackend/pages/download.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DownloadPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/node_modules/next/link.js [ssr] (ecmascript)");
;
;
function DownloadPage() {
    const platforms = [
        {
            name: "Windows",
            description: "64-bit installer with auto-updates and DirectX optimizations.",
            action: "Download .exe",
            href: "#"
        },
        {
            name: "macOS",
            description: "Universal build for Apple Silicon and Intel Macs.",
            action: "Download .dmg",
            href: "#"
        },
        {
            name: "Linux",
            description: "AppImage build tested on Ubuntu, SteamOS, and Arch.",
            action: "Download AppImage",
            href: "#"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.page,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.header,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        style: styles.kicker,
                        children: "Downloads"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                        style: styles.title,
                        children: "Choose your platform"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        style: styles.subtitle,
                        children: "Pick the build that fits your rig. Cross-play is enabled across all platforms."
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.grid,
                children: platforms.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: styles.card,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                        style: styles.cardTitle,
                                        children: p.name
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                                        lineNumber: 41,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        style: styles.cardText,
                                        children: p.description
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                                        lineNumber: 42,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                                lineNumber: 40,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: p.href,
                                style: styles.cardButton,
                                children: p.action
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                                lineNumber: 44,
                                columnNumber: 13
                            }, this)
                        ]
                    }, p.name, true, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/GitHub/ThangBackend/pages/download.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
const styles = {
    page: {
        minHeight: "100vh",
        background: "#0b0d10",
        color: "#e7e9ed",
        padding: "40px 20px 80px"
    },
    header: {
        maxWidth: "960px",
        margin: "0 auto 32px"
    },
    kicker: {
        margin: 0,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontSize: "12px",
        color: "#8aa2ff"
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
        maxWidth: "960px",
        margin: "0 auto",
        display: "grid",
        gap: "16px",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
    },
    card: {
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "8px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
    },
    cardTitle: {
        margin: "0 0 6px 0",
        fontSize: "18px"
    },
    cardText: {
        margin: 0,
        color: "#c8cbd2",
        lineHeight: 1.5,
        fontSize: "14px"
    },
    cardButton: {
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px 14px",
        background: "#0f62fe",
        borderRadius: "6px",
        border: "1px solid #1f2a3a",
        color: "#f5f7fb",
        fontWeight: 700,
        textDecoration: "none",
        fontSize: "14px"
    }
};
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__02a1495a._.js.map