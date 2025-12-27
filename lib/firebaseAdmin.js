// lib/firebaseAdmin.js
import admin from "firebase-admin";

if (!admin.apps.length) {
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
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
    console.log("[FirebaseAdmin] Successfully initialized");
  } catch (error) {
    console.error("[FirebaseAdmin] Initialization error:", error);
    throw error;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

export default admin;
