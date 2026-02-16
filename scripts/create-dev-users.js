/**
 * Creates PIE dev accounts in Firebase Auth (helloworld1@gmail.com .. helloworld10@gmail.com).
 * Run once: npm run create-dev-users
 * Requires: .env.local (or .env) with Firebase Admin credentials
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const admin = require("firebase-admin");

const PASSWORD = "12345678";
const EMAIL_PREFIX = "helloworld";
const EMAIL_SUFFIX = "@gmail.com";
const COUNT = 10;

async function main() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY");
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: (privateKey || "").replace(/\\n/g, "\n"),
      }),
    });
  }

  const auth = admin.auth();

  for (let i = 1; i <= COUNT; i++) {
    const email = `${EMAIL_PREFIX}${i}${EMAIL_SUFFIX}`;
    try {
      await auth.createUser({ email, password: PASSWORD, emailVerified: true });
      console.log(`Created: ${email}`);
    } catch (e) {
      if (e.code === "auth/email-already-exists") {
        try {
          await auth.updateUser((await auth.getUserByEmail(email)).uid, { password: PASSWORD });
          console.log(`Updated password for: ${email}`);
        } catch (e2) {
          console.warn(`Could not update ${email}:`, e2.message);
        }
      } else {
        console.error(`Failed ${email}:`, e.message);
      }
    }
  }

  console.log("Done. Dev accounts ready for PIE.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
