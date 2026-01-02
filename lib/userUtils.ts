import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export interface User {
  _id: string;
  email: string;
  username?: string | null;
  inviteCode?: string; // Unique code for invite links
  rank: number;
  coins: number;
  avatarId: string;
  bannerId: string;
  equippedTitle: string;
  partyId?: string; // Added partyId to interface
  created_at: Date;
  updated_at: Date;
}

/**
 * Generates a random alphanumeric invite code
 */
function generateInviteCode(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Retrieves a user by UID, or creates a new one if they don't exist.
 * Handles race conditions for concurrent creation requests.
 * Ensures user is always in a party.
 */
export async function getOrCreateUser(
  uid: string,
  email: string
): Promise<User> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const users = db.collection("users");
  const parties = db.collection("parties");

  // Ensure username uniqueness index exists (best effort)
  try {
    await users.createIndex({ username: 1 }, { unique: true, sparse: true });
    // Ensure inviteCode uniqueness index exists
    await users.createIndex({ inviteCode: 1 }, { unique: true, sparse: true });
  } catch (e) {
    // Ignore index creation errors
    console.warn("[UserUtils] Index warning:", e);
  }

  // Try to find existing user
  let user = await users.findOne({ _id: uid });

  if (!user) {
    // Create a solo party for the new user
    const newParty = {
      leaderUid: uid,
      region: "US-East",
      members: [
        {
          uid: uid,
          username: null, // Username not set yet
          joinedAt: new Date(),
          isReady: true,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const partyResult = await parties.insertOne(newParty);

    const newUser: User = {
      _id: uid,
      email,
      username: null,
      inviteCode: generateInviteCode(),
      rank: 0,
      coins: 100,
      avatarId: "Alpha",
      bannerId: "Alpha",
      equippedTitle: "unequipped",
      partyId: partyResult.insertedId.toString(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    try {
      await users.insertOne(newUser);
      user = newUser;
    } catch (insertError: any) {
      // Handle race condition (Duplicate Key Error 11000)
      if (insertError.code === 11000) {
        console.log("[UserUtils] Race condition detected, fetching user again");
        user = await users.findOne({ _id: uid });
        if (!user) {
          throw insertError;
        }
      } else {
        throw insertError;
      }
    }
  }

  // Backfill missing fields for existing users
  let needsUpdate = false;
  const updates: any = {};

  // Backfill inviteCode
  if (!user.inviteCode) {
    updates.inviteCode = generateInviteCode();
    user.inviteCode = updates.inviteCode;
    needsUpdate = true;
  }

  // Also ensure they have a party if missing (Legacy Support)
  if (!user.partyId) {
    const newParty = {
      leaderUid: uid,
      region: "US-East",
      members: [
        {
          uid: uid,
          username: user.username || "Unknown",
          joinedAt: new Date(),
          isReady: true,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const partyResult = await parties.insertOne(newParty);

    updates.partyId = partyResult.insertedId.toString();
    user.partyId = updates.partyId;
    needsUpdate = true;
  }

  if (needsUpdate) {
    await users.updateOne({ _id: uid }, { $set: updates });
  }

  return {
    ...user,
    avatarId: user.avatarId || "Alpha",
    bannerId: user.bannerId || "Alpha",
    equippedTitle: user.equippedTitle || "unequipped",
  } as User;
}
