import {
  GameLiftClient,
  StartMatchmakingCommand,
  StopMatchmakingCommand,
  Player,
} from "@aws-sdk/client-gamelift";

const client = new GameLiftClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function startMatchmaking(configName: string, players: Player[]) {
  const command = new StartMatchmakingCommand({
    ConfigurationName: configName,
    Players: players,
  });

  const response = await client.send(command);
  return {
    ticketId: response.MatchmakingTicket?.TicketId,
    estimatedWaitTime: response.MatchmakingTicket?.EstimatedWaitTime,
  };
}

export async function stopMatchmaking(ticketId: string) {
  const command = new StopMatchmakingCommand({
    TicketId: ticketId,
  });
  await client.send(command);
}

export function createPlayerObject(
  playerId: string,
  username: string,
  skill: number,
  latencyMap: Record<string, number>
): Player {
  // --- FIX FOR GAMELIFT ANYWHERE ---
  // If the client reports latency to 'us-east-1', copy it to your Custom Location name.
  // This tells FlexMatch: "My ping to 'custom-home-office' is the same as my ping to 'us-east-1'."

  const customLocationName = "custom-home-office"; // Must match your AWS Location Name exactly

  if (latencyMap["us-east-1"] && !latencyMap[customLocationName]) {
    latencyMap[customLocationName] = latencyMap["us-east-1"];
  }
  // ---------------------------------

  // Ensure skill is a number for GameLift AttributeValue
  return {
    PlayerId: playerId,
    PlayerAttributes: {
      skill: { N: skill },
      username: { S: username },
    },
    LatencyInMs: latencyMap,
  };
}
