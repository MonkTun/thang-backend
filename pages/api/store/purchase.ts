import type { NextApiRequest, NextApiResponse } from "next";
import admin from "@/lib/firebaseAdmin";
import clientPromise from "@/lib/mongodb";

const DB_NAME = process.env.NEXT_PUBLIC_DB_NAME || "game";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Verify Bearer Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (e) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const uid = decodedToken.uid;

    // 3. Validate Request Body
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ error: "Missing itemId" });
    }

    // 4. Connect to DB & Fetch Item
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const itemsCollection = db.collection("items");
    const usersCollection = db.collection("users");

    // Fetch item from DB instead of hardcoded catalog
    const item = await itemsCollection.findOne({ itemId: itemId });

    if (!item) {
      return res.status(404).json({ error: "Item not found in catalog" });
    }

    // 5. Execute Purchase Transaction
    // Atomic operation: Check balance AND deduct cost AND add item
    const result = await usersCollection.findOneAndUpdate(
      {
        _id: uid,
        coins: { $gte: item.price }, // Ensure user has enough coins
      },
      {
        $inc: { coins: -item.price },
        $push: {
          inventory: {
            itemId: item.itemId,
            name: item.name,
            type: item.type || "misc", // Store item type if available
            purchasedAt: new Date(),
          },
        },
      },
      { returnDocument: "after" }
    );

    // 6. Handle Result
    if (!result) {
      // Check if user exists to give better error message
      const user = await usersCollection.findOne({ _id: uid });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // If user exists, it must be insufficient funds
      return res
        .status(400)
        .json({
          error: "Insufficient funds",
          currentBalance: user.coins,
          required: item.price,
        });
    }

    return res.status(200).json({
      success: true,
      message: `Purchased ${item.name}`,
      newBalance: result.coins,
      item: {
        itemId: item.itemId,
        name: item.name,
        price: item.price,
      },
    });
  } catch (error: any) {
    console.error("[Store Purchase] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
