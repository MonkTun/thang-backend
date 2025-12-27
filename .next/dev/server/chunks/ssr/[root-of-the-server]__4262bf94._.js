module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[project]/Documents/GitHub/ThangBackend/lib/firebase.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "googleProvider",
    ()=>googleProvider
]);
// lib/firebase.js
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__ = __turbopack_context__.i("[externals]/firebase/app [external] (firebase/app, esm_import, [project]/Documents/GitHub/ThangBackend/node_modules/firebase)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__ = __turbopack_context__.i("[externals]/firebase/auth [external] (firebase/auth, esm_import, [project]/Documents/GitHub/ThangBackend/node_modules/firebase)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyC71tD5hmCaAdz-UWKne3f2toowkD0EpVQ"),
    authDomain: ("TURBOPACK compile-time value", "thang-dev-6ef90.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "thang-dev-6ef90"),
    storageBucket: ("TURBOPACK compile-time value", "thang-dev-6ef90.firebasestorage.app"),
    messagingSenderId: ("TURBOPACK compile-time value", "295898504642"),
    appId: ("TURBOPACK compile-time value", "1:295898504642:web:14da06f985d5cc5a804a5b")
};
// Check if a Firebase app is already initialized to avoid errors
// during hot-reloading in development.
const app = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["getApps"])().length === 0 ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["getApps"])()[0];
const auth = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["getAuth"])(app);
const googleProvider = new __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["GoogleAuthProvider"]();
;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Documents/GitHub/ThangBackend/pages/profile.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>ProfilePage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__ = __turbopack_context__.i("[externals]/firebase/auth [external] (firebase/auth, esm_import, [project]/Documents/GitHub/ThangBackend/node_modules/firebase)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/lib/firebase.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
function ProfilePage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [isLoggingOut, setIsLoggingOut] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [usernameSaving, setUsernameSaving] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [usernameError, setUsernameError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const fetchUserData = async ()=>{
            try {
                const idToken = localStorage.getItem("idToken");
                const uid = localStorage.getItem("uid");
                if (!idToken || !uid) {
                    console.warn("No token or uid in localStorage, redirecting to login");
                    router.push("/login");
                    return;
                }
                console.log("Fetching user data from /api/auth/bootstrap...");
                const response = await fetch("/api/auth/bootstrap", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to fetch user: ${response.status} - ${errorData.error || "Unknown error"}`);
                }
                const userData = await response.json();
                console.log("User data fetched:", userData);
                setUser(userData);
                setUsername(userData.username || "");
            } catch (err) {
                console.error("Error fetching user:", err.message);
                setError(err.message);
            } finally{
                setLoading(false);
            }
        };
        fetchUserData();
    }, [
        router
    ]);
    const handleLogout = async ()=>{
        setIsLoggingOut(true);
        try {
            console.log("Signing out...");
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["auth"]);
            localStorage.removeItem("idToken");
            localStorage.removeItem("uid");
            console.log("Logged out");
            router.push("/login");
        } catch (err) {
            console.error("Logout error:", err.message);
            setError("Failed to log out");
        } finally{
            setIsLoggingOut(false);
        }
    };
    const handleUsernameSave = async ()=>{
        const trimmed = username.trim();
        setUsernameError(null);
        if (!trimmed) {
            setUsernameError("Username is required");
            return;
        }
        if (!/^(?=.{3,20}$)[a-zA-Z0-9_-]+$/.test(trimmed)) {
            setUsernameError("Use 3-20 letters, numbers, underscores or hyphens");
            return;
        }
        const token = localStorage.getItem("idToken");
        if (!token) {
            setUsernameError("Missing token. Please log in again.");
            return;
        }
        try {
            setUsernameSaving(true);
            const resp = await fetch("/api/auth/username", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: trimmed
                })
            });
            if (!resp.ok) {
                const data = await resp.json();
                if (resp.status === 409) {
                    setUsernameError("That username is taken. Try another.");
                    return;
                }
                throw new Error(data.error || "Failed to set username");
            }
            setUser((prev)=>prev ? {
                    ...prev,
                    username: trimmed,
                    updated_at: new Date().toISOString()
                } : prev);
            setUsername(trimmed);
        } catch (err) {
            setUsernameError(err.message || "Failed to set username");
        } finally{
            setUsernameSaving(false);
        }
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.card,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    style: {
                        color: "#c8cbd2"
                    },
                    children: "Loading user data..."
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                    lineNumber: 163,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                lineNumber: 162,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
            lineNumber: 161,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.card,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                        style: {
                            ...styles.title,
                            fontSize: "22px",
                            color: "#f97068",
                            marginBottom: "12px"
                        },
                        children: "Error"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                        lineNumber: 173,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        style: {
                            color: "#c8cbd2",
                            marginBottom: "18px"
                        },
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push("/login"),
                        style: styles.button,
                        children: "Back to Login"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                        lineNumber: 184,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                lineNumber: 172,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
            lineNumber: 171,
            columnNumber: 7
        }, this);
    }
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: styles.container,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: styles.card,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                        style: {
                            ...styles.title,
                            fontSize: "22px",
                            marginBottom: "12px"
                        },
                        children: "No user data"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                        lineNumber: 196,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        style: {
                            color: "#c8cbd2",
                            marginBottom: "18px"
                        },
                        children: "Could not load user profile"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                        lineNumber: 201,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.push("/login"),
                        style: styles.button,
                        children: "Back to Login"
                    }, void 0, false, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                        lineNumber: 204,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                lineNumber: 195,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
            lineNumber: 194,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: styles.card,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                    style: styles.title,
                    children: "Your Profile"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                    lineNumber: 215,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.profileSection,
                    children: [
                        user.username ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.profileField,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: "Username"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 220,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.value,
                                    children: user.username
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 221,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 219,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.missingBox,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.inputGroup,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            style: styles.inputLabel,
                                            htmlFor: "username",
                                            children: "Choose a username"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                            lineNumber: 226,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            id: "username",
                                            type: "text",
                                            value: username,
                                            onChange: (e)=>{
                                                const value = e.target.value;
                                                setUsername(value);
                                            },
                                            placeholder: "Pick something unique",
                                            style: styles.input,
                                            maxLength: 20
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                            lineNumber: 229,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            style: styles.inputHelper,
                                            children: "3-20 characters. Letters, numbers, underscores, or hyphens."
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                            lineNumber: 242,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 225,
                                    columnNumber: 15
                                }, this),
                                usernameError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: styles.inlineError,
                                    children: usernameError
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 247,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: handleUsernameSave,
                                    disabled: usernameSaving,
                                    style: {
                                        ...styles.button,
                                        opacity: usernameSaving ? 0.6 : 1,
                                        cursor: usernameSaving ? "wait" : "pointer"
                                    },
                                    children: usernameSaving ? "Saving..." : "Save username"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 249,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 224,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.profileField,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: "Firebase UID"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 264,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                    style: styles.code,
                                    children: user._id
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 265,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 263,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.profileField,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: "Email"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 269,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.value,
                                    children: user.email
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 270,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 268,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.profileField,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: "Rank"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 274,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.value,
                                    children: user.rank
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 275,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 273,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.profileField,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: "Coins"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 279,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.value,
                                    children: user.coins
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 280,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 278,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.profileField,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: "Created At"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 284,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.value,
                                    children: new Date(user.created_at).toLocaleString()
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 285,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 283,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.profileField,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    style: styles.label,
                                    children: "Updated At"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 291,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.value,
                                    children: new Date(user.updated_at).toLocaleString()
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 292,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 290,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                    lineNumber: 217,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                    onClick: handleLogout,
                    disabled: isLoggingOut,
                    style: {
                        ...styles.button,
                        background: isLoggingOut ? "#0d57e0" : "#0f62fe",
                        borderColor: isLoggingOut ? "#1c355c" : "#1f2a3a",
                        opacity: isLoggingOut ? 0.9 : 1,
                        cursor: isLoggingOut ? "wait" : "pointer",
                        transform: isLoggingOut ? "scale(0.995)" : "scale(1)"
                    },
                    children: isLoggingOut ? "Logging out..." : "Logout"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                    lineNumber: 298,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: styles.debugBox,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                            style: {
                                margin: "0 0 10px 0",
                                fontSize: "15px",
                                color: "#e7e9ed"
                            },
                            children: "What this proves"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 314,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                            style: styles.list,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                    children: "Firebase Auth works (you logged in)"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 320,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                    children: "Bootstrap endpoint works (created user in MongoDB)"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 321,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                    children: "MongoDB persistence works (data survives refresh)"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 322,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                                    children: "Backend is ready for Unreal Engine"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 323,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 319,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            style: {
                                marginTop: "12px",
                                fontSize: "12px",
                                color: "#9aa3b5"
                            },
                            children: [
                                "Check MongoDB Atlas to see your user document in the",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                    children: "game.users"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                                    lineNumber: 327,
                                    columnNumber: 13
                                }, this),
                                " collection."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                            lineNumber: 325,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
                    lineNumber: 313,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
            lineNumber: 214,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/GitHub/ThangBackend/pages/profile.tsx",
        lineNumber: 213,
        columnNumber: 5
    }, this);
}
const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#0b0d10",
        color: "#e7e9ed",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        padding: "20px"
    },
    card: {
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "6px",
        padding: "36px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
        maxWidth: "540px",
        width: "100%"
    },
    title: {
        margin: "0 0 28px 0",
        fontSize: "26px",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: "#f5f7fb",
        textAlign: "center"
    },
    profileSection: {
        marginBottom: "30px"
    },
    profileField: {
        marginBottom: "18px"
    },
    label: {
        display: "block",
        fontSize: "12px",
        fontWeight: "bold",
        color: "#9aa3b5",
        textTransform: "uppercase",
        marginBottom: "4px"
    },
    value: {
        margin: 0,
        fontSize: "15px",
        color: "#e7e9ed"
    },
    missingBox: {
        marginBottom: "24px",
        padding: "16px",
        border: "1px dashed #2b3544",
        borderRadius: "6px",
        background: "#0f1218"
    },
    inputGroup: {
        textAlign: "left",
        marginBottom: "10px"
    },
    inputLabel: {
        display: "block",
        marginBottom: "6px",
        fontSize: "12px",
        letterSpacing: "0.02em",
        color: "#9aa3b5",
        textTransform: "uppercase"
    },
    input: {
        width: "100%",
        padding: "12px",
        borderRadius: "4px",
        border: "1px solid #1f2a3a",
        background: "#0b0d10",
        color: "#f5f7fb",
        fontSize: "14px",
        outline: "none"
    },
    inputHelper: {
        margin: "6px 0 0 0",
        fontSize: "12px",
        color: "#98a2b3"
    },
    inlineError: {
        background: "#2c1f24",
        color: "#f2c2cb",
        border: "1px solid #3a252d",
        padding: "10px",
        borderRadius: "4px",
        marginBottom: "12px",
        fontSize: "13px"
    },
    code: {
        display: "block",
        background: "#0f1218",
        border: "1px solid #1e232d",
        padding: "10px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "monospace",
        color: "#d9dce2",
        wordBreak: "break-all"
    },
    button: {
        width: "100%",
        padding: "12px 20px",
        fontSize: "15px",
        fontWeight: 600,
        border: "1px solid #1f2a3a",
        borderRadius: "4px",
        background: "#0f62fe",
        color: "#f5f7fb",
        cursor: "pointer",
        marginBottom: "18px",
        transition: "background 0.2s ease, border-color 0.2s ease, transform 0.05s ease"
    },
    debugBox: {
        background: "#0f1218",
        border: "1px solid #1e232d",
        padding: "14px",
        borderRadius: "4px",
        fontSize: "13px",
        color: "#98a2b3"
    },
    list: {
        margin: "0 0 0 20px",
        fontSize: "13px",
        color: "#c8cbd2"
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4262bf94._.js.map