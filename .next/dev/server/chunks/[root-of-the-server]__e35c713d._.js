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
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
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
"[project]/Documents/GitHub/ThangBackend/pages/api/friends/request.ts [api] (ecmascript)", ((__turbopack_context__) => {
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
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    try {
        // 1. Authenticate
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Missing authorization header"
            });
        }
        const token = authHeader.split("Bearer ")[1];
        const decodedToken = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$firebaseAdmin$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"].auth().verifyIdToken(token);
        const senderUid = decodedToken.uid;
        // 2. Validate Input
        const { targetUsername } = req.body;
        if (!targetUsername) {
            return res.status(400).json({
                error: "Missing targetUsername"
            });
        }
        const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$mongodb$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"];
        const db = client.db(DB_NAME);
        const users = db.collection("users");
        // 3. Fetch Sender and Target
        const sender = await users.findOne({
            _id: senderUid
        });
        if (!sender) return res.status(404).json({
            error: "Sender profile not found"
        });
        if (!sender.username) {
            return res.status(400).json({
                error: "You must set a username first"
            });
        }
        // Case insensitive search for target
        const target = await users.findOne({
            username: {
                $regex: new RegExp(`^${targetUsername}$`, "i")
            }
        });
        if (!target) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        if (target._id === senderUid) {
            return res.status(400).json({
                error: "Cannot send friend request to yourself"
            });
        }
        // 4. Check existing relationship
        // Check if already friends
        const isFriend = sender.friends?.some((f)=>f.uid === target._id);
        if (isFriend) {
            return res.status(400).json({
                error: "Already friends"
            });
        }
        // Check if request already pending (incoming or outgoing)
        const existingRequest = sender.friendRequests?.some((r)=>r.uid === target._id);
        if (existingRequest) {
            return res.status(400).json({
                error: "Friend request already pending"
            });
        }
        // 5. Execute Updates
        const now = new Date();
        // Add outgoing request to sender
        await users.updateOne({
            _id: senderUid
        }, {
            $push: {
                friendRequests: {
                    uid: target._id,
                    username: target.username,
                    type: "outgoing",
                    createdAt: now
                }
            }
        });
        // Add incoming request to target
        await users.updateOne({
            _id: target._id
        }, {
            $push: {
                friendRequests: {
                    uid: senderUid,
                    username: sender.username,
                    type: "incoming",
                    createdAt: now
                }
            }
        });
        return res.status(200).json({
            success: true,
            message: "Friend request sent"
        });
    } catch (error) {
        console.error("[Friend Request] Error:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e35c713d._.js.map