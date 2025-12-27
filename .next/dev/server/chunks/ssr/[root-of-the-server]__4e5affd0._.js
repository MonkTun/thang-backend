module.exports = [
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
"[project]/Documents/GitHub/ThangBackend/pages/login.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__ = __turbopack_context__.i("[externals]/firebase/auth [external] (firebase/auth, esm_import, [project]/Documents/GitHub/ThangBackend/node_modules/firebase)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/lib/firebase.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/node_modules/next/router.js [ssr] (ecmascript)");
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
function LoginPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [needsUsername, setNeedsUsername] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [usernameError, setUsernameError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [usernameSaving, setUsernameSaving] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const handleGoogleSignIn = async ()=>{
        setLoading(true);
        setError(null);
        setUsernameError(null);
        try {
            // Step 1: Sign in with Google via Firebase
            console.log("🔐 Starting Google Sign-In...");
            const result = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["signInWithPopup"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["auth"], __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["googleProvider"]);
            const user = result.user;
            console.log("Google Sign-In successful:", {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            });
            // Step 2: Get Firebase ID token
            const idToken = await user.getIdToken();
            console.log("🔑 Got ID Token:", idToken.substring(0, 50) + "...");
            // Step 3: Call bootstrap endpoint to create/fetch user in MongoDB
            console.log("📡 Calling /api/auth/bootstrap...");
            const controller = new AbortController();
            const timeout = setTimeout(()=>controller.abort(), 15000);
            const bootstrapResponse = await fetch("/api/auth/bootstrap", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!bootstrapResponse.ok) {
                const errorData = await bootstrapResponse.json();
                throw new Error(`Bootstrap failed: ${bootstrapResponse.status} - ${errorData.error || "Unknown error"}`);
            }
            const userData = await bootstrapResponse.json();
            console.log("Bootstrap successful, user data:", userData);
            // Step 4: Store token in localStorage for profile page
            localStorage.setItem("idToken", idToken);
            localStorage.setItem("uid", user.uid);
            // Step 5: Require username if missing
            if (userData.username) {
                console.log("🎯 Redirecting to /profile...");
                router.push("/profile");
                return;
            }
            console.log("📝 Username required. Prompting user to choose one.");
            setNeedsUsername(true);
            setLoading(false);
        } catch (err) {
            if (err?.name === "AbortError") {
                setError("Request timed out. Please try again.");
                console.error("Sign-in error: bootstrap request timed out");
                return;
            }
            const errorMessage = err.message || "Unknown error occurred";
            console.error("Sign-in error:", errorMessage);
            // Provide helpful error messages
            let friendlyMessage = errorMessage;
            if (errorMessage.includes("500")) {
                friendlyMessage = "Server error (500). Check that Firebase Admin credentials are configured in .env.local. See FIREBASE_SETUP_ADMIN.md for instructions.";
            } else if (errorMessage.includes("401")) {
                friendlyMessage = "Authentication failed. Make sure your Google account is allowed to sign in.";
            } else if (errorMessage.includes("Bootstrap")) {
                friendlyMessage = "Failed to create user. Check server logs for details.";
            }
            setError(friendlyMessage);
        } finally{
            setLoading(false);
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
            setUsernameError("Missing token. Please sign in again.");
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
            console.log("Username set. Redirecting to profile...");
            router.push("/profile");
        } catch (err) {
            setUsernameError(err.message || "Failed to set username");
        } finally{
            setUsernameSaving(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: styles.container,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: styles.card,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                    style: styles.title,
                    children: "Thang Backend"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                    lineNumber: 179,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    style: styles.subtitle,
                    children: needsUsername ? "Choose a username to finish setup" : "Sign in to validate the backend"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                    lineNumber: 180,
                    columnNumber: 9
                }, this),
                !needsUsername ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: handleGoogleSignIn,
                            disabled: loading,
                            style: {
                                ...styles.button,
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? "not-allowed" : "pointer"
                            },
                            children: loading ? "Signing in..." : "Login with Google"
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                            lineNumber: 188,
                            columnNumber: 13
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.error,
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                            lineNumber: 200,
                            columnNumber: 23
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.debugBox,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                    style: styles.debugTitle,
                                    children: "Debug Info"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                    lineNumber: 203,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.debugText,
                                    children: [
                                        "Signs in with Firebase, then calls",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("code", {
                                            children: "/api/auth/bootstrap"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                            lineNumber: 206,
                                            columnNumber: 17
                                        }, this),
                                        "to create or fetch your user in MongoDB."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                    lineNumber: 204,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.debugText,
                                    children: "Open the console (F12) for step-by-step logs."
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                    lineNumber: 209,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                            lineNumber: 202,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.inputGroup,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                    style: styles.inputLabel,
                                    htmlFor: "username",
                                    children: "Username"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                    lineNumber: 217,
                                    columnNumber: 15
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
                                    maxLength: 20,
                                    autoFocus: true
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                    lineNumber: 220,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.inputHelper,
                                    children: "3-20 characters. Letters, numbers, underscores, or hyphens."
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                    lineNumber: 234,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                            lineNumber: 216,
                            columnNumber: 13
                        }, this),
                        usernameError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.error,
                            children: usernameError
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                            lineNumber: 239,
                            columnNumber: 31
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
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                            lineNumber: 241,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
            lineNumber: 178,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
        lineNumber: 177,
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
        fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    },
    card: {
        background: "#11141a",
        border: "1px solid #1e232d",
        borderRadius: "6px",
        padding: "36px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
        maxWidth: "420px",
        width: "100%",
        textAlign: "center"
    },
    title: {
        margin: "0 0 10px 0",
        fontSize: "28px",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: "#f5f7fb"
    },
    subtitle: {
        margin: "0 0 28px 0",
        fontSize: "14px",
        color: "#98a2b3"
    },
    inputGroup: {
        textAlign: "left",
        marginBottom: "12px"
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
        background: "#0f1218",
        color: "#f5f7fb",
        fontSize: "14px",
        outline: "none"
    },
    inputHelper: {
        margin: "6px 0 0 0",
        fontSize: "12px",
        color: "#98a2b3"
    },
    button: {
        width: "100%",
        padding: "12px 20px",
        fontSize: "15px",
        fontWeight: 600,
        letterSpacing: "0.01em",
        border: "1px solid #1f2a3a",
        borderRadius: "4px",
        background: "#0f62fe",
        color: "#f5f7fb",
        transition: "background 0.2s ease, border-color 0.2s ease, transform 0.05s ease",
        marginBottom: "18px"
    },
    error: {
        background: "#2c1f24",
        color: "#f2c2cb",
        border: "1px solid #3a252d",
        padding: "12px",
        borderRadius: "4px",
        marginBottom: "18px",
        fontSize: "13px",
        textAlign: "left"
    },
    debugBox: {
        background: "#0f1218",
        border: "1px solid #1e232d",
        padding: "14px",
        borderRadius: "4px",
        fontSize: "12px",
        textAlign: "left",
        color: "#98a2b3"
    },
    debugTitle: {
        margin: "0 0 6px 0",
        fontSize: "13px",
        fontWeight: 600,
        color: "#e7e9ed"
    },
    debugText: {
        margin: "0 0 6px 0",
        lineHeight: 1.5
    }
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4e5affd0._.js.map