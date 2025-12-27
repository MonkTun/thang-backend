# 🚨 Missing Firebase Admin Credentials

## Problem
Your `.env.local` is missing **server-side Firebase Admin credentials**. This is why you're getting a **500 error** in the bootstrap endpoint.

## Solution

You have two credentials in Firebase:
1. **Public credentials** (NEXT_PUBLIC_*) - For client-side auth ✅ You have these
2. **Private credentials** (no NEXT_PUBLIC prefix) - For server-side admin operations ❌ You're missing these

## How to Get Firebase Admin Credentials

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com
2. Select your project: `thang-dev-6ef90`
3. Click ⚙️ (Settings icon) in the top-left
4. Click "Project settings"

### Step 2: Go to Service Accounts Tab
1. Click the "Service Accounts" tab
2. Make sure you're on the "Firebase Admin SDK" section
3. Click "Generate New Private Key" button

### Step 3: Copy the JSON Credentials
A file will download. It looks like:
```json
{
  "type": "service_account",
  "project_id": "thang-dev-6ef90",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc@thang-dev-6ef90.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### Step 4: Add to `.env.local`
Add these three lines to your `.env.local`:

```env
FIREBASE_PROJECT_ID=thang-dev-6ef90
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@thang-dev-6ef90.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### ⚠️ Important Notes
- **Keep the `FIREBASE_PRIVATE_KEY` exactly as it appears** in the JSON
- **Do NOT commit `.env.local` to GitHub** (it's already in `.gitignore`)
- The `\n` in the private key is correct - keep them as-is
- Copy the entire value including the quotes

### Your `.env.local` Should Look Like:
```env
MONGODB_URI=mongodb+srv://youngjep:lhMwAIgIVHhmrWAT@thang-dev.ebbdvtl.mongodb.net/?appName=thang-dev

# --- ADMIN CREDENTIALS (Server-side, KEEP SECRET) ---
FIREBASE_PROJECT_ID=thang-dev-6ef90
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@thang-dev-6ef90.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# --- CLIENT CREDENTIALS (Public, OK to expose) ---
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyC71tD5hmCaAdz-UWKne3f2toowkD0EpVQ"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="thang-dev-6ef90.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="thang-dev-6ef90"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="thang-dev-6ef90.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="295898504642"
NEXT_PUBLIC_FIREBASE_APP_ID="1:295898504642:web:14da06f985d5cc5a804a5b"
```

### Step 5: Restart Dev Server
After adding the credentials:
```bash
# Stop the server with Ctrl+C
# Then restart it
npm run dev
```

### Step 6: Test Again
1. Go to http://localhost:3000
2. Try to login with Google again
3. You should get past the bootstrap call (no more 500 error)

---

## 🔍 How to Verify It Works

After adding credentials, check the server logs:
```
[FirebaseAdmin] Successfully initialized
[Bootstrap] Verifying Firebase token...
[Bootstrap] Token verified for UID: xyz123...
[Bootstrap] Connected to MongoDB
[Bootstrap] Looking for existing user: xyz123...
```

If you see these logs, the credentials are correct!

---

## 🚨 If You Still Get 500 Error

Check the terminal where `npm run dev` is running. Look for error messages like:
- `Missing Firebase Admin credentials` - You didn't add all three env vars
- `Certificate error` - The private key is malformed
- `Timeout error` - MongoDB connection issue

Report the exact error message if you're stuck.
