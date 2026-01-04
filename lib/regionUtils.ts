import { NextApiRequest } from "next";

interface NextApiRequestWithGeo extends NextApiRequest {
  geo?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

// Mapping of Country Codes to AWS Regions (Ordered by preference)
export const COUNTRY_TO_REGION_MAP: Record<string, string[]> = {
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

  // Middle East
  BH: ["me-south-1", "ap-south-1"],
  AE: ["me-central-1", "ap-south-1"],

  // Africa
  ZA: ["af-south-1", "eu-west-1"],
};

export const DEFAULT_REGION = "us-east-1";

export function detectRegion(req: NextApiRequestWithGeo): string {
  const country = req.geo?.country || req.headers["x-vercel-ip-country"];

  if (country && typeof country === "string") {
    const possibleRegions = COUNTRY_TO_REGION_MAP[country.toUpperCase()];
    if (possibleRegions && possibleRegions.length > 0) {
      return possibleRegions[0];
    }
  }

  return DEFAULT_REGION;
}
