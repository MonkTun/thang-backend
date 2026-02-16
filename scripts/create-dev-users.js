/**
 * Creates or fixes PIE dev accounts in Firebase Auth and MongoDB.
 * Emails: helloworld1@gmail.com .. helloworld10@gmail.com
 * Usernames: tester1 .. tester10, password: 12345678
 *
 * Run: npm run create-dev-users
 * If run again, updates existing users (password + username) instead of creating duplicates.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const admin = require("firebase-admin");
const { MongoClient } = require("mongodb");

const PASSWORD = "12345678";
const EMAIL_PREFIX = "helloworld";
const EMAIL_SUFFIX = "@gmail.com";
const USERNAME_PREFIX = "tester";
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
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.NEXT_PUBLIC_DB_NAME || "game";

  if (!mongoUri) {
    console.warn("MONGODB_URI not set – skipping MongoDB username updates");
  }

  let mongoClient;
  if (mongoUri) {
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
  }

  const db = mongoClient ? mongoClient.db(dbName) : null;
  const usersCol = db ? db.collection("users") : null;

  for (let i = 1; i <= COUNT; i++) {
    const email = `${EMAIL_PREFIX}${i}${EMAIL_SUFFIX}`;
    const username = `${USERNAME_PREFIX}${i}`;

    try {
      const existingUser = await auth.getUserByEmail(email).catch(() => null);

      if (existingUser) {
        await auth.updateUser(existingUser.uid, {
          password: PASSWORD,
          displayName: username,
          emailVerified: true,
        });
        console.log(`Fixed: ${email} → ${username}`);

        if (usersCol) {
          const r = await usersCol.updateOne(
            { _id: existingUser.uid },
            { $set: { username, updated_at: new Date() } }
          );
          if (r.modifiedCount > 0) {
            console.log(`  → MongoDB username set to ${username}`);
          }
        }
      } else {
        await auth.createUser({
          email,
          password: PASSWORD,
          displayName: username,
          emailVerified: true,
        });
        console.log(`Created: ${email} → ${username}`);
      }
    } catch (e) {
      console.error(`Failed ${email}:`, e.message);
    }
  }

  if (mongoClient) {
    await mongoClient.close();
  }

  console.log("Done. Dev accounts ready for PIE.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
