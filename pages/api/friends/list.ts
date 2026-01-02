import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Authenticate
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Connect to DB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // 3. Fetch User Data to get Friend UIDs
    const currentUser = await users.findOne(
      { _id: uid },
      { projection: { friends: 1, friendRequests: 1, blocked: 1 } }
    );

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendList = currentUser.friends || [];
    const friendRequests = currentUser.friendRequests || [];
    const blockedUsers = currentUser.blocked || [];

    // 4. Hydrate Friends with Real-Time Presence
    // We need to fetch the latest data for each friend to check 'lastSeen'
    const friendUids = friendList.map((f: any) => f.uid);

    let hydratedFriends = [];
    if (friendUids.length > 0) {
      const friendsData = await users
        .find(
          { _id: { $in: friendUids } },
          {
            projection: {
              username: 1,
              lastSeen: 1,
              lastSeenWeb: 1,
              lastSeenUnreal: 1,
              status: 1,
              rank: 1,
              partyId: 1,
              avatarId: 1,
              equippedTitle: 1,
              bannerId: 1,
            },
          }
        )
        .toArray();

      // Create a map for easy lookup
      const friendsMap = new Map(friendsData.map((f) => [f._id, f]));

      // Fetch Party Info for friends in parties
      const partyIds = friendsData
        .map((f) => f.partyId)
        .filter((pid) => pid)
        .map((pid) => new ObjectId(pid));

      let partiesMap = new Map();
      if (partyIds.length > 0) {
        const partiesData = await db
          .collection("parties")
          .find(
            { _id: { $in: partyIds } },
            { projection: { privacy: 1, members: 1, leaderUid: 1 } }
          )
          .toArray();
        partiesMap = new Map(partiesData.map((p) => [p._id.toString(), p]));
      }

      // Threshold for "Online" (e.g., seen in last 60 seconds)
      // Heartbeat is every 30s, so 60s allows for 1 missed beat before offline.
      const ONLINE_THRESHOLD_MS = 60 * 1000;
      const now = new Date().getTime();

      hydratedFriends = friendList.map((f: any) => {
        const u = friendsMap.get(f.uid) as any;

        // Determine Status Priority: Unreal > Web > Offline
        let effectiveStatus = "Offline";
        let clientType = "offline";
        let isOnline = false;

        const lastSeenUnreal = u?.lastSeenUnreal
          ? new Date(u.lastSeenUnreal).getTime()
          : 0;
        const lastSeenWeb = u?.lastSeenWeb
          ? new Date(u.lastSeenWeb).getTime()
          : 0;

        const isUnrealOnline = now - lastSeenUnreal < ONLINE_THRESHOLD_MS;
        const isWebOnline = now - lastSeenWeb < ONLINE_THRESHOLD_MS;

        if (isUnrealOnline) {
          effectiveStatus = u?.status || "Online";
          clientType = "unreal";
          isOnline = true;
        } else if (isWebOnline) {
          effectiveStatus = "Online";
          clientType = "web";
          isOnline = true;
        }

        // Party Info
        let partyInfo = null;
        let isPartyLeader = false;
        if (u?.partyId) {
          const p = partiesMap.get(u.partyId.toString());
          if (p) {
            partyInfo = {
              id: u.partyId.toString(),
              privacy: p.privacy || "private",
              isFull: (p.members?.length || 0) >= 5,
            };
            if (p.leaderUid === f.uid) {
              isPartyLeader = true;
            }
          }
        }

        return {
          ...f,
          username: u?.username || f.username,
          avatarId: u?.avatarId || "Alpha",
          bannerId: u?.bannerId || "Alpha",
          rank: u?.rank || 0,
          equippedTitle: u?.equippedTitle || "unequipped",
          status: effectiveStatus,
          client: clientType,
          isOnline,
          party: partyInfo,
          isPartyLeader,
        };
      });
    }

    // 5. Hydrate Friend Requests (Get Avatars)
    let hydratedRequests = [];
    const requestUids = friendRequests.map((r: any) => r.uid);
    if (requestUids.length > 0) {
      const requestData = await users
        .find(
          { _id: { $in: requestUids } },
          {
            projection: {
              username: 1,
              avatarId: 1,
              rank: 1,
              equippedTitle: 1,
              bannerId: 1,
            },
          }
        )
        .toArray();

      const requestMap = new Map(requestData.map((u) => [u._id, u]));

      hydratedRequests = friendRequests.map((r: any) => {
        const u = requestMap.get(r.uid) as any;
        return {
          ...r,
          username: u?.username || r.username,
          avatarId: u?.avatarId || "Alpha",
          bannerId: u?.bannerId || "Alpha",
          rank: u?.rank || 0,
          equippedTitle: u?.equippedTitle || "unequipped",
        };
      });
    }

    // 6. Return Lists
    return res.status(200).json({
      friends: hydratedFriends,
      friendRequests: hydratedRequests,
      blocked: blockedUsers,
    });
  } catch (error: any) {
    console.error("[Friend List] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
