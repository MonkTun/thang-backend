import type { NextApiRequest, NextApiResponse } from "next";
import {
  GameLiftClient,
  DescribeMatchmakingConfigurationsCommand,
} from "@aws-sdk/client-gamelift";
import admin from "@/lib/firebaseAdmin";

const client = new GameLiftClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Authenticate (Optional, but good practice)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }
    await admin.auth().verifyIdToken(authHeader.split("Bearer ")[1]);

    // 2. Fetch Configurations from GameLift
    console.log(
      `[Matchmaking] Fetching configs from region: ${process.env.AWS_REGION}`
    );
    const command = new DescribeMatchmakingConfigurationsCommand({});
    const response = await client.send(command);

    console.log(
      `[Matchmaking] Found ${
        response.Configurations?.length || 0
      } configurations.`
    );

    const configs =
      response.Configurations?.map((config) => ({
        name: config.Name,
        description: config.Description || config.Name,
        ruleSet: config.RuleSetName,
      })) || [];

    return res.status(200).json({ configs });
  } catch (error: any) {
    console.error("Fetch Matchmaking Configs Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
