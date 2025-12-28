import type { NextApiRequest, NextApiResponse } from "next";
import { GameLiftClient, ListLocationsCommand } from "@aws-sdk/client-gamelift";

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

// Mapping of Country Codes to AWS Regions (Ordered by preference)
const COUNTRY_TO_REGION_MAP: Record<string, string[]> = {
  // North America
  US: ["us-east-1", "us-east-2", "us-west-1", "us-west-2"],
  CA: ["ca-central-1", "us-east-1", "us-west-2"],
  MX: ["us-east-2", "us-west-1"],

  // Europe
  GB: ["eu-west-2", "eu-west-1", "eu-central-1"],
  DE: ["eu-central-1", "eu-west-1", "eu-north-1"],
  FR: ["eu-west-3", "eu-west-1", "eu-central-1"],
  IE: ["eu-west-1", "eu-west-2", "eu-central-1"],
  SE: ["eu-north-1", "eu-central-1", "eu-west-1"],
  NL: ["eu-central-1", "eu-west-1", "eu-west-3"],
  IT: ["eu-south-1", "eu-central-1", "eu-west-3"],
  ES: ["eu-south-2", "eu-west-3", "eu-central-1"],

  // Asia Pacific
  JP: ["ap-northeast-1", "ap-northeast-3"],
  KR: ["ap-northeast-2", "ap-northeast-1"],
  IN: ["ap-south-1", "ap-southeast-1"],
  SG: ["ap-southeast-1", "ap-south-1"],
  AU: ["ap-southeast-2", "ap-southeast-1"],
  // CN: ["cn-north-1", "cn-northwest-1"], // Excluded: Requires separate AWS China account
  HK: ["ap-east-1", "ap-southeast-1"],
  TW: ["ap-northeast-1", "ap-east-1"],

  // South America
  BR: ["sa-east-1", "us-east-1"],
  AR: ["sa-east-1", "us-east-1"],
  CL: ["sa-east-1", "us-east-1"],
  CO: ["us-east-1", "sa-east-1"],

  // Middle East
  BH: ["me-south-1", "ap-south-1"],
  AE: ["me-central-1", "ap-south-1"],

  // Africa
  ZA: ["af-south-1", "eu-west-1"],

  // Default fallback
  DEFAULT: ["us-east-1", "eu-central-1", "ap-northeast-1"],
};

export default async function handler(
  req: NextApiRequestWithGeo,
  res: NextApiResponse
) {
  // NOTE: This endpoint acts as a "Region preference resolver".
  // It does NOT measure actual network latency.
  // Latency probing will be added from the game client (Unreal) in Phase 2.

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 1. Read req.geo (Vercel specific) or headers
    // req.geo is available in Edge Middleware, but for Node.js Serverless Functions, we use headers.
    const country =
      req.geo?.country ||
      (req.headers["x-vercel-ip-country"] as string) ||
      "US"; // Default to US if not found

    console.log(`Detected Country: ${country} (Source: ${req.geo?.country ? "req.geo" : req.headers["x-vercel-ip-country"] ? "header" : "default"})`);

    // 2. Map country -> AWS regions
    const preferredRegions =
      COUNTRY_TO_REGION_MAP[country] || COUNTRY_TO_REGION_MAP["DEFAULT"];

    // 3. ListLocations
    // This retrieves all locations (regions and custom locations) registered with GameLift
    let orderedRegions: string[] = [];

    try {
      const command = new ListLocationsCommand({});
      const response = await client.send(command);

      const availableLocations = response.Locations || [];

      // Extract location names (AWS Region codes)
      const availableRegionCodes = new Set(
        availableLocations.map((loc) => loc.LocationName)
      );

      // 4. Return ordered list
      // Filter preferred regions by availability in GameLift
      orderedRegions = preferredRegions.filter((region) =>
        availableRegionCodes.has(region)
      );

      // Add remaining available regions that were not in the preference list
      availableLocations.forEach((loc) => {
        if (loc.LocationName && !orderedRegions.includes(loc.LocationName)) {
          orderedRegions.push(loc.LocationName);
        }
      });
    } catch (error) {
      console.warn(
        "GameLift ListLocations failed (likely no credentials). Returning preferred regions only.",
        error
      );
      // Fallback: Return preferred regions as-is for local dev / fallback
      orderedRegions = [...preferredRegions];
    }

    return res.status(200).json({
      country,
      regions: orderedRegions,
    });
  } catch (error) {
    console.error("Error fetching GameLift regions:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
}
