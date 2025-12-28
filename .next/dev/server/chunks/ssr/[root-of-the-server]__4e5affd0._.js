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
    // Email/Password State
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [isSignUp, setIsSignUp] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [showForgotPassword, setShowForgotPassword] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [resetEmail, setResetEmail] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [resetMessage, setResetMessage] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // Find Email State
    const [findEmailUsername, setFindEmailUsername] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [foundEmail, setFoundEmail] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const handleAuthSuccess = async (user)=>{
        console.log("Auth successful:", {
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
    };
    const handleGoogleSignIn = async ()=>{
        setLoading(true);
        setError(null);
        setUsernameError(null);
        try {
            // Step 1: Sign in with Google via Firebase
            console.log("🔐 Starting Google Sign-In...");
            const result = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["signInWithPopup"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["auth"], __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["googleProvider"]);
            await handleAuthSuccess(result.user);
        } catch (err) {
            if (err?.name === "AbortError") {
                setError("Request timed out. Please try again.");
            } else {
                console.error("Google Sign-In Error:", err);
                setError(err.message || "Failed to sign in with Google");
            }
            setLoading(false);
        }
    };
    const handleEmailAuth = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let userCredential;
            if (isSignUp) {
                userCredential = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["createUserWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["auth"], email, password);
            } else {
                userCredential = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["signInWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["auth"], email, password);
            }
            await handleAuthSuccess(userCredential.user);
        } catch (err) {
            console.error("Email Auth Error:", err);
            setError(err.message || "Authentication failed");
            setLoading(false);
        }
    };
    const handlePasswordReset = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResetMessage(null);
        try {
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$29$__["sendPasswordResetEmail"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebase$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["auth"], resetEmail);
            setResetMessage("Password reset email sent! Check your inbox.");
        } catch (err) {
            console.error("Password Reset Error:", err);
            setError(err.message || "Failed to send reset email");
        } finally{
            setLoading(false);
        }
    };
    const handleFindEmail = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError(null);
        setFoundEmail(null);
        try {
            const res = await fetch("/api/auth/find-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: findEmailUsername
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to find email");
            }
            const data = await res.json();
            setFoundEmail(data.email);
        } catch (err) {
            setError(err.message);
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
                    lineNumber: 251,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                    style: styles.subtitle,
                    children: needsUsername ? "Choose a username to finish setup" : "Sign in to validate the backend"
                }, void 0, false, {
                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                    lineNumber: 252,
                    columnNumber: 9
                }, this),
                !needsUsername ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                    children: showForgotPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("form", {
                        onSubmit: handlePasswordReset,
                        style: {
                            width: "100%"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                style: {
                                    ...styles.subtitle,
                                    marginBottom: "16px"
                                },
                                children: "Reset Password"
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 262,
                                columnNumber: 17
                            }, this),
                            resetMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    ...styles.error,
                                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                                    borderColor: "#22c55e",
                                    color: "#22c55e"
                                },
                                children: resetMessage
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 266,
                                columnNumber: 19
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.error,
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 277,
                                columnNumber: 27
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: styles.inputGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                        style: styles.inputLabel,
                                        children: "Email"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 280,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                        type: "email",
                                        value: resetEmail,
                                        onChange: (e)=>setResetEmail(e.target.value),
                                        style: styles.input,
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 281,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 279,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: loading,
                                style: {
                                    ...styles.button,
                                    opacity: loading ? 0.6 : 1,
                                    marginBottom: "12px"
                                },
                                children: loading ? "Sending..." : "Send Reset Link"
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 290,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setShowForgotPassword(false),
                                style: {
                                    ...styles.button,
                                    background: "transparent",
                                    border: "1px solid #333",
                                    color: "#888"
                                },
                                children: "Back to Login"
                            }, void 0, false, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 302,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: "24px",
                                    paddingTop: "16px",
                                    borderTop: "1px solid #333"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                        style: {
                                            ...styles.inputLabel,
                                            marginBottom: "8px"
                                        },
                                        children: "Forgot Email?"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 322,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            gap: "8px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Enter Username",
                                                value: findEmailUsername,
                                                onChange: (e)=>setFindEmailUsername(e.target.value),
                                                style: {
                                                    ...styles.input,
                                                    flex: 1
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 326,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: handleFindEmail,
                                                disabled: loading || !findEmailUsername,
                                                style: {
                                                    ...styles.button,
                                                    width: "auto",
                                                    padding: "0 16px",
                                                    background: "#333"
                                                },
                                                children: "Find"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 333,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 325,
                                        columnNumber: 19
                                    }, this),
                                    foundEmail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: "8px",
                                            fontSize: "14px",
                                            color: "#22c55e"
                                        },
                                        children: [
                                            "Email hint: ",
                                            foundEmail
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 348,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 315,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                        lineNumber: 261,
                        columnNumber: 15
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                onClick: handleGoogleSignIn,
                                disabled: loading,
                                style: {
                                    ...styles.button,
                                    opacity: loading ? 0.6 : 1,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    marginBottom: "24px",
                                    background: "#ffffff",
                                    color: "#1f1f1f",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "12px",
                                    border: "1px solid #dadce0",
                                    borderRadius: "4px",
                                    padding: "12px 16px",
                                    fontFamily: "'Roboto', sans-serif",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    transition: "background-color .2s, box-shadow .2s"
                                },
                                onMouseOver: (e)=>{
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor = "#f7f8f8";
                                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.12)";
                                    }
                                },
                                onMouseOut: (e)=>{
                                    e.currentTarget.style.backgroundColor = "#ffffff";
                                    e.currentTarget.style.boxShadow = "none";
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                        width: "18",
                                        height: "18",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        viewBox: "0 0 48 48",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                fill: "#EA4335",
                                                d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 402,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                fill: "#4285F4",
                                                d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 406,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                fill: "#FBBC05",
                                                d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 410,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                fill: "#34A853",
                                                d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 414,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                fill: "none",
                                                d: "M0 0h48v48H0z"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 418,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 396,
                                        columnNumber: 19
                                    }, this),
                                    loading ? "Signing in..." : "Sign in with Google"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 362,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    margin: "24px 0",
                                    color: "#666"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1,
                                            height: "1px",
                                            background: "#333"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 431,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        style: {
                                            padding: "0 12px",
                                            fontSize: "14px"
                                        },
                                        children: "OR"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 432,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1,
                                            height: "1px",
                                            background: "#333"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 435,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 423,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("form", {
                                onSubmit: handleEmailAuth,
                                style: {
                                    width: "100%"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.inputGroup,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                style: styles.inputLabel,
                                                children: "Email"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 440,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                type: "email",
                                                value: email,
                                                onChange: (e)=>setEmail(e.target.value),
                                                style: styles.input,
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 441,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 439,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.inputGroup,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                style: styles.inputLabel,
                                                children: "Password"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 450,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                type: "password",
                                                value: password,
                                                onChange: (e)=>setPassword(e.target.value),
                                                style: styles.input,
                                                required: true,
                                                minLength: 6
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 451,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    textAlign: "right",
                                                    marginTop: "6px"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setShowForgotPassword(true),
                                                    style: {
                                                        background: "none",
                                                        border: "none",
                                                        color: "#9aa3b5",
                                                        cursor: "pointer",
                                                        padding: 0,
                                                        fontSize: "12px",
                                                        textDecoration: "underline"
                                                    },
                                                    children: "Forgot Password?"
                                                }, void 0, false, {
                                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                    lineNumber: 460,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                                lineNumber: 459,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 449,
                                        columnNumber: 19
                                    }, this),
                                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: styles.error,
                                        children: error
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 478,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: loading,
                                        style: {
                                            ...styles.button,
                                            opacity: loading ? 0.6 : 1,
                                            marginBottom: "16px"
                                        },
                                        children: loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 480,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 438,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: "16px",
                                    fontSize: "12px",
                                    color: "#666"
                                },
                                children: [
                                    "By logging in, you agree to our",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        href: "/terms",
                                        style: {
                                            color: "#3b82f6",
                                            textDecoration: "none"
                                        },
                                        children: "Terms of Service"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 501,
                                        columnNumber: 19
                                    }, this),
                                    " ",
                                    "and",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                        href: "/privacy",
                                        style: {
                                            color: "#3b82f6",
                                            textDecoration: "none"
                                        },
                                        children: "Privacy Policy"
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                        lineNumber: 508,
                                        columnNumber: 19
                                    }, this),
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                lineNumber: 497,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
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
                                    lineNumber: 522,
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
                                    lineNumber: 525,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    style: styles.inputHelper,
                                    children: "3-20 characters. Letters, numbers, underscores, or hyphens."
                                }, void 0, false, {
                                    fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                                    lineNumber: 539,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                            lineNumber: 521,
                            columnNumber: 13
                        }, this),
                        usernameError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: styles.error,
                            children: usernameError
                        }, void 0, false, {
                            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
                            lineNumber: 544,
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
                            lineNumber: 546,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
            lineNumber: 250,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/GitHub/ThangBackend/pages/login.tsx",
        lineNumber: 249,
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