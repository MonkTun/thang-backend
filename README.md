# Thang Backend

Backend services for the Thang game, built with Next.js, Firebase Authentication, and MongoDB.

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- MongoDB Atlas Account
- Firebase Project

### 2. Installation

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following keys:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (Secret)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Database
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_DB_NAME=game

# Steam (Optional)
STEAM_WEB_API_KEY=...
```

**PIE Dev Login:** When running in development (`npm run dev`), the `/api/auth/dev-login` endpoint is enabled for email/password auth. Used by Unreal PIE "Dev Login" button with pre-allocated dev accounts (`helloworld1@gmail.com`, `helloworld2@gmail.com`, etc., password: `12345678`). Create these accounts in Firebase Auth for local testing. Disabled automatically in production builds.

### 4. Run Development Server

```bash
npm run dev
```

---

## 📚 API Documentation

All endpoints require a Firebase ID Token in the Authorization header:
`Authorization: Bearer <FIREBASE_ID_TOKEN>`

### Authentication & User Management

#### `POST /api/auth/bootstrap`

**Description:** Called by the web client after Firebase login. Creates the user in MongoDB if they don't exist.

- **Body:** None (uses token claims).

#### `POST /api/game/bootstrap`

**Description:** Called by the Unreal Engine game client. Authenticates user and returns initial game state.

- **Body:** None.
- **Response:**
  ```json
  {
    "user": { ... },
    "serverTime": "2025-01-01T00:00:00.000Z",
    "config": { "version": "1.0.0" }
  }
  ```

#### `GET /api/user/profile`

**Description:** Fetch the current user's profile data (coins, rank, inventory).

### Store & Economy

#### `POST /api/store/purchase`

**Description:** Purchase an item using coins.

- **Body:**
  ```json
  { "itemId": "item_sword_01" }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Purchased Basic Sword",
    "newBalance": 50,
    "item": { ... }
  }
  ```

---

## 🗄️ Database Schema (MongoDB)

### `users` Collection

Automatically created on first login.

```json
{
  "_id": "firebase_uid_string",
  "email": "user@example.com",
  "username": "PlayerOne",
  "coins": 100,
  "rank": 0,
  "inventory": [
    {
      "itemId": "item_sword_01",
      "name": "Basic Sword",
      "purchasedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

### `items` Collection

**IMPORTANT:** You must manually populate this collection for the store to work. Insert these documents into your `items` collection:

```json
[
  {
    "itemId": "item_sword_01",
    "name": "Basic Sword",
    "price": 50,
    "type": "weapon",
    "description": "A sharp steel sword."
  },
  {
    "itemId": "item_shield_01",
    "name": "Wooden Shield",
    "price": 40,
    "type": "armor",
    "description": "A sturdy wooden shield."
  },
  {
    "itemId": "potion_health",
    "name": "Health Potion",
    "price": 10,
    "type": "consumable",
    "description": "Restores 50 HP."
  }
]
```
