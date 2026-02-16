import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { User } from "@/lib/types";

// Re-export User type for convenience
export type { User } from "@/lib/types";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

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
  email: string,
  displayName?: string | null
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
          username: displayName?.trim() || null, // Username from displayName or set later
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
      username: displayName?.trim() || null,
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

    // Retry loop for inviteCode collisions
    let attempts = 0;
    while (attempts < 3) {
      try {
        if (attempts > 0) {
          newUser.inviteCode = generateInviteCode();
        }
        await users.insertOne(newUser);
        user = newUser;
        break; // Success
      } catch (insertError: any) {
        // Handle race condition (Duplicate Key Error 11000)
        if (insertError.code === 11000) {
          // Check if it's the _id (UID) that collided
          // Note: keyPattern might be undefined in some drivers/versions, but usually present
          const isUidCollision =
            insertError.keyPattern?._id ||
            insertError.message?.includes("_id_") ||
            insertError.message?.includes("dup key: { _id");

          if (isUidCollision) {
            console.log(
              "[UserUtils] Race condition: User already exists (UID collision)"
            );
            // Cleanup the unused party we just created
            await parties.deleteOne({ _id: partyResult.insertedId });

            user = await users.findOne({ _id: uid });
            if (!user) {
              // This is weird, it said duplicate but we can't find it?
              throw insertError;
            }
            break; // Found existing user
          }

          // Check if it's the inviteCode that collided
          const isInviteCodeCollision =
            insertError.keyPattern?.inviteCode ||
            insertError.message?.includes("inviteCode_") ||
            insertError.message?.includes("dup key: { inviteCode");

          if (isInviteCodeCollision) {
            console.warn(
              `[UserUtils] Invite code collision (${newUser.inviteCode}), retrying...`
            );
            attempts++;
            continue;
          }

          // Unknown collision
          throw insertError;
        } else {
          throw insertError;
        }
      }
    }

    if (!user) {
      throw new Error("Failed to create user after multiple attempts");
    }
  }

  // Backfill missing fields for existing users
  let needsUpdate = false;
  const updates: any = {};

  // Backfill username from displayName if missing
  if (!user.username && displayName?.trim()) {
    updates.username = displayName.trim();
    user.username = updates.username;
    needsUpdate = true;
  }

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
