module.exports = [
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
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
"[project]/Documents/GitHub/ThangBackend/pages/api/auth/find-email.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$mongodb$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/GitHub/ThangBackend/lib/mongodb.js [api] (ecmascript)");
;
const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({
                error: "Username is required"
            });
        }
        const client = await __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$GitHub$2f$ThangBackend$2f$lib$2f$mongodb$2e$js__$5b$api$5d$__$28$ecmascript$29$__["default"];
        const db = client.db(DB_NAME);
        const users = db.collection("users");
        // Case insensitive search
        const user = await users.findOne({
            username: {
                $regex: new RegExp(`^${username}$`, "i")
            }
        });
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        if (!user.email) {
            return res.status(404).json({
                error: "No email associated with this user"
            });
        }
        // Mask email (e.g., "j***@gmail.com")
        const [local, domain] = user.email.split("@");
        const maskedLocal = local.length > 2 ? local[0] + "***" + local[local.length - 1] : local + "***";
        const maskedEmail = `${maskedLocal}@${domain}`;
        return res.status(200).json({
            email: maskedEmail
        });
    } catch (error) {
        console.error("[Find Email] Error:", error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__27aeb704._.js.map