# 🚀 Frontend Testing Guide - Complete

## ✅ What's Ready

Your Next.js application now has a **complete web testing interface**:

### Pages Created

1. **`/pages/login.tsx`** - Login page
   - Google Sign-In button (uses Firebase Auth)
   - Retrieves Firebase ID token
   - Calls `/api/auth/bootstrap` endpoint
   - Stores token in localStorage
   - Redirects to `/profile`

2. **`/pages/profile.tsx`** - Profile page
   - Displays user data from MongoDB
   - Shows: UID, email, rank, coins, created_at, updated_at
   - Logout button
   - Persists across page refreshes (data in MongoDB)

3. **`/pages/index.tsx`** - Entry point
   - Auto-redirects to `/login`

### API Route (Already Exists)

4. **`/api/auth/bootstrap`** - Backend API
   - ✅ Validates Firebase ID token
   - ✅ Creates or fetches user in MongoDB
   - ✅ Handles race conditions
   - ✅ Returns user object

---

## 🧪 How to Test

### Step 1: Start the Server

```bash
npm run dev
```

Server will be at: `http://localhost:3000`

### Step 2: Open in Browser

```
http://localhost:3000
```

You will be redirected to `/login`

### Step 3: Click "Login with Google"

- A popup will appear
- Sign in with your Google account
- Firebase will authenticate
- Browser console (F12) will show detailed logs

### Step 4: Verify Bootstrap Call

In the browser console, you should see:

```
🔐 Starting Google Sign-In...
✅ Google Sign-In successful: { uid: "...", email: "...", displayName: "..." }
🔑 Got ID Token: eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYzEyMzQ1In0...
📡 Calling /api/auth/bootstrap...
✅ Bootstrap successful, user data: { _id: "...", email: "...", rank: 0, coins: 100, ... }
🎯 Redirecting to /profile...
```

### Step 5: See Your Profile

You should now see:
- Your Firebase UID
- Your email
- Rank: 0
- Coins: 100
- Created At: timestamp

### Step 6: Verify MongoDB Persistence

Go to **MongoDB Atlas**:
1. Click your cluster
2. Click "Collections"
3. Look for database: `game` (or whatever NEXT_PUBLIC_DB_NAME is set to)
4. Look for collection: `users`
5. You should see your user document with:
   ```json
   {
     "_id": "your-firebase-uid",
     "email": "your-email@gmail.com",
     "rank": 0,
     "coins": 100,
     "created_at": "2025-12-27T...",
     "updated_at": "2025-12-27T..."
   }
   ```

### Step 7: Test Persistence

1. Refresh the page (`Cmd+R` or `Ctrl+R`)
2. You should still see the same profile
3. This proves data came from MongoDB, not from memory

### Step 8: Logout

1. Click "🚪 Logout" button
2. You'll be redirected to `/login`
3. localStorage will be cleared

---

## 📊 What This Proves

If all steps work, you've proven:

✅ **Firebase Auth Works**
- Google Sign-In works
- ID token is retrieved
- Token is valid

✅ **Backend API Works**
- `/api/auth/bootstrap` receives requests
- Validates Firebase tokens
- Creates new users in MongoDB
- Fetches returning users

✅ **MongoDB Persistence Works**
- User documents are created
- Data survives page refresh
- Multiple users can be stored

✅ **Frontend ↔ Backend Integration Works**
- Login page calls API correctly
- Profile page displays data correctly
- Error handling works

---

## 🐛 Debugging

### Check Server Logs

In the terminal where `npm run dev` is running:

```
GET /login 200 in 234ms (compile: 230ms)
GET /profile 200 in 45ms
POST /api/auth/bootstrap 200 in 156ms
```

### Check Browser Console

Press `F12` in browser, go to **Console** tab. You'll see all the logs prefixed with:
- 🔐 Authentication steps
- 🔑 Token info
- 📡 API calls
- ✅ Success messages
- ❌ Error messages

### Check Network Tab

Press `F12` in browser, go to **Network** tab. You'll see:

```
POST /api/auth/bootstrap
Status: 200 OK
Response: { _id: "...", email: "...", ... }
Headers: Authorization: Bearer <token>
```

### Check MongoDB

Go to **MongoDB Atlas** → **Collections** → Look for `game.users`

If user doesn't appear:
1. Check if MONGODB_URI is correct in `.env.local`
2. Check if database name is correct (default: `game`)
3. Check server logs for connection errors

---

## 🎯 Architecture Summary

```
User Opens Browser (http://localhost:3000)
          ↓
    Redirects to /login
          ↓
  User Clicks "Login with Google"
          ↓
  Firebase Auth popup appears
          ↓
  User signs in with Google account
          ↓
  Frontend gets Firebase ID token
          ↓
  Frontend calls POST /api/auth/bootstrap
          ↓
  Backend validates token with Firebase Admin SDK
          ↓
  Backend checks MongoDB for existing user
          ↓
  If new user, creates document; if returning, fetches it
          ↓
  Backend returns user object
          ↓
  Frontend stores token in localStorage
          ↓
  Frontend redirects to /profile
          ↓
  /profile page fetches user from /api/auth/bootstrap
          ↓
  User profile displayed on screen
          ↓
  ✅ System works end-to-end
```

---

## 📋 Checklist Before Moving Forward

- [ ] Server is running: `npm run dev`
- [ ] Can access http://localhost:3000
- [ ] Can click "Login with Google" button
- [ ] Google auth popup appears
- [ ] Can sign in with real Google account
- [ ] Browser console shows all the log messages
- [ ] Redirected to /profile after login
- [ ] Profile page shows correct user data
- [ ] User appears in MongoDB Atlas collections
- [ ] Can refresh /profile page and data persists
- [ ] Can click logout and get redirected to /login

Once all ✅, your backend is ready for **Unreal Engine integration**.

---

## 🚀 Next Steps (After Verification)

Once this flow works perfectly:

1. **Update Unreal Engine client** to call the same `/api/auth/bootstrap` endpoint
2. **Build more game endpoints** (match creation, joining, results, etc.)
3. **Add matchmaking logic**
4. **Add party system**
5. **Add persistent stats** (wins, losses, etc.)

But **don't move forward until this web interface works end-to-end**.

One solid endpoint beats ten broken ones.

---

## 💡 Remember

This web frontend exists **only to validate** that:
- Firebase Auth is configured correctly
- MongoDB connection works
- API routes are correct
- Error handling is solid

Once Unreal Engine connects and the **exact same flow** works there, you know the backend is production-ready.

You're not building a product; you're building **confidence** that your backend works.
