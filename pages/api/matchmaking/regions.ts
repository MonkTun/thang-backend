import type { NextApiRequest, NextApiResponse } from "next";
import { GameLiftClient, ListLocationsCommand } from "@aws-sdk/client-gamelift";
import { COUNTRY_TO_REGION_MAP, detectRegion } from "@/lib/regionUtils";

interface NextApiRequestWithGeo extends NextApiRequest {
  geo?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

// Initialize GameLift Client
// Ensure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION are set in environment variables
const client = new GameLiftClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Default fallback regions if country is unknown
const DEFAULT_REGIONS = ["us-east-1", "eu-central-1", "ap-northeast-2"];

export default async function handler(
  req: NextApiRequestWithGeo,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Detect User's Country from Vercel Headers
    const recommendedRegion = detectRegion(req);
    const country = req.geo?.country || req.headers["x-vercel-ip-country"];

    // 2. Fetch Available GameLift Locations
    let availableRegions = DEFAULT_REGIONS;

    try {
      const command = new ListLocationsCommand({});
      const response = await client.send(command);
      const locations = response.Locations?.map((l) => l.LocationName).filter(
        (l): l is string => !!l
      );

      if (locations && locations.length > 0) {
        availableRegions = locations;
      }
    } catch (err) {
      console.warn("[Region] Failed to fetch from AWS, using defaults", err);
    }

    return res.status(200).json({
      recommended: recommendedRegion,
      regions: availableRegions,
      detectedCountry: country || "Unknown",
    });
  } catch (error) {
    console.error("[Region] Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
