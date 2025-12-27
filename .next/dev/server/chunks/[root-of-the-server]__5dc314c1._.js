module.exports = [
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Documents/GitHub/ThangBackend/lib/firebaseAdmin.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adminAuth",
    ()=>adminAuth,
    "adminDb",
    ()=>adminDb,
    "default",
    ()=>__TURBOPACK__default__export__
]);
// lib/firebaseAdmin.js
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin [external] (firebase-admin, cjs, [project]/Documents/GitHub/ThangBackend/node_modules/firebase-admin)");
;
if (!__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$2d$admin$29$__["default"].apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) {
        console.error("[FirebaseAdmin] Missing required environment variables:");
        console.error("  - FIREBASE_PROJECT_ID:", projectId ? "✓" : "✗");
        console.error("  - FIREBASE_CLIENT_EMAIL:", clientEmail ? "✓" : "✗");
        console.error("  - FIREBASE_PRIVATE_KEY:", privateKey ? "✓" : "✗");
        throw new Error("Missing Firebase Admin credentials in environment variables");
    }
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$2d$admin$29$__["default"].initializeApp({
            credential: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$2d$admin$29$__["default"].credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, "\n")
            })
        });
        console.log("[FirebaseAdmin] Successfully initialized");
    } catch (error) {
        console.error("[FirebaseAdmin] Initialization error:", error);
        throw error;
    }
}
const adminAuth = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$2d$admin$29$__["default"].auth();
const adminDb = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$2d$admin$29$__["default"].firestore();
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$firebase$2d$admin$29$__["default"];
}),
"[project]/Documents/GitHub/ThangBackend/lib/mongodb.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$mongodb$29$__ = __turbopack_context__.i("[externals]/mongodb [external] (mongodb, cjs, [project]/Documents/GitHub/ThangBackend/node_modules/mongodb)");
;
if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}
const uri = process.env.MONGODB_URI;
const options = {
    maxPoolSize: 10
};
let client;
let clientPromise;
if ("TURBOPACK compile-time truthy", 1) {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!/*TURBOPACK member replacement*/ __turbopack_context__.g._mongoClientPromise) {
        client = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongodb__$5b$external$5d$__$28$mongodb$2c$__cjs$2c$__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$node_modules$2f$mongodb$29$__["MongoClient"](uri, options);
        /*TURBOPACK member replacement*/ __turbopack_context__.g._mongoClientPromise = client.connect();
    }
    clientPromise = /*TURBOPACK member replacement*/ __turbopack_context__.g._mongoClientPromise;
} else //TURBOPACK unreachable
;
const __TURBOPACK__default__export__ = clientPromise;
}),
"[project]/Documents/GitHub/ThangBackend/pages/api/auth/username.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebaseAdmin$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/lib/firebaseAdmin.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$mongodb$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/lib/mongodb.js [api] (ecmascript)");
;
;
const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";
const USERNAME_REGEX = /^(?=.{3,20}$)[a-zA-Z0-9_-]+$/;
function escapeRegExp(input) {
    return input.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    try {
        // Extract and verify Firebase token
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!token) {
            return res.status(401).json({
                error: "Missing authorization token"
            });
        }
        let decoded;
        try {
            decoded = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebaseAdmin$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].auth().verifyIdToken(token);
        } catch (error) {
            console.error("[Username] Firebase verification error:", error.message);
            return res.status(401).json({
                error: "Invalid or expired token"
            });
        }
        const uid = decoded.uid;
        if (!uid) {
            return res.status(401).json({
                error: "Invalid token: missing uid"
            });
        }
        const rawUsername = req.body?.username?.trim();
        if (!rawUsername) {
            return res.status(400).json({
                error: "Username is required"
            });
        }
        if (!USERNAME_REGEX.test(rawUsername)) {
            return res.status(400).json({
                error: "Username must be 3-20 chars, letters/numbers/underscore/hyphen only"
            });
        }
        const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$mongodb$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"];
        const db = client.db(DB_NAME);
        const users = db.collection("users");
        // Ensure unique sparse index on username
        try {
            await users.createIndex({
                username: 1
            }, {
                unique: true,
                sparse: true
            });
        } catch (indexError) {
            console.warn("[Username] Username index warning:", indexError.message);
        }
        // Check for conflicts (case-insensitive)
        const conflict = await users.findOne({
            username: {
                $regex: `^${escapeRegExp(rawUsername)}$`,
                $options: "i"
            },
            _id: {
                $ne: uid
            }
        });
        if (conflict) {
            return res.status(409).json({
                error: "Username already taken"
            });
        }
        const result = await users.findOneAndUpdate({
            _id: uid
        }, {
            $set: {
                username: rawUsername,
                updated_at: new Date()
            },
            $setOnInsert: {
                created_at: new Date(),
                email: decoded.email || "",
                rank: 0,
                coins: 100
            }
        }, {
            returnDocument: "after",
            upsert: true
        });
        if (!result.value) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        return res.status(200).json(result.value);
    } catch (error) {
        console.error("[Username] CRITICAL ERROR:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5dc314c1._.js.map