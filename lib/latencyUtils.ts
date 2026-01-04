/**
 * Utility to measure latency to AWS Regions via HTTP.
 * Note: This is an approximation. Real game latency (UDP) might differ.
 */

function getDynamoDbEndpoint(region: string): string {
  return `https://dynamodb.${region}.amazonaws.com`;
}

function isAwsRegionName(location: string): boolean {
  // Regions look like: us-east-1, ap-northeast-2, eu-central-1
  // Local Zones look like: us-west-2-den-1, us-east-1-dfw-2
  return /^[a-z]{2}(?:-[a-z]+)+-\d$/.test(location);
}

export async function measureLatency(
  regions: string[]
): Promise<Record<string, number>> {
  const latencyMap: Record<string, number> = {};

  // We will ping all regions in parallel to be fast
  const promises = regions.map(async (region) => {
    if (!region) return;
    if (!isAwsRegionName(region)) return;
    const url = getDynamoDbEndpoint(region);

    try {
      const start = performance.now();
      // We use 'no-cors' mode because we don't care about the response content,
      // we just want to measure the round-trip time.
      // DynamoDB endpoints might not return CORS headers for our domain,
      // but the browser still performs the network request.
      await fetch(url, { method: "GET", mode: "no-cors", cache: "no-cache" });
      const end = performance.now();
      const latency = Math.round(end - start);
      latencyMap[region] = latency;
    } catch (e) {
      console.warn(`Failed to ping region ${region}`, e);
      // If ping fails, we just don't include it in the map.
      // The backend will fallback to geo-location if map is empty/partial.
    }
  });

  await Promise.all(promises);
  return latencyMap;
}

export function getBestRegion(
  latencyMap: Record<string, number>
): string | null {
  let bestRegion: string | null = null;
  let minLatency = Infinity;

  for (const [region, latency] of Object.entries(latencyMap)) {
    if (latency < minLatency) {
      minLatency = latency;
      bestRegion = region;
    }
  }

  return bestRegion;
}
