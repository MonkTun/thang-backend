import {
  GameLiftClient,
  StartMatchmakingCommand,
  StopMatchmakingCommand,
  DescribeMatchmakingCommand,
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

/** Terminal states mean the ticket is done and a new one can be created */
const TERMINAL_STATUSES = ["COMPLETED", "FAILED", "TIMED_OUT", "CANCELLED"];

export async function isTicketActive(ticketId: string): Promise<boolean> {
  try {
    const command = new DescribeMatchmakingCommand({
      TicketIds: [ticketId],
    });
    const response = await client.send(command);

    if (!response.TicketList || response.TicketList.length === 0) {
      return false; // Ticket not found = not active
    }

    const status = response.TicketList[0].Status;
    return status ? !TERMINAL_STATUSES.includes(status) : false;
  } catch {
    return false; // On error (e.g. NotFoundException), treat as not active
  }
}

export function createPlayerObject(
  playerId: string,
  username: string,
  skill: number,
  latencyMap: Record<string, number>,
  team?: string
): Player {
  
  // If the client reports latency to 'us-east-1', copy it to your Custom Location name.
  // This tells FlexMatch: "My ping to 'custom-home-office' is the same as my ping to 'us-east-1'."

  const customLocationName = "custom-home-office"; // Must match the AWS Location Name exactly

  if (latencyMap["us-east-1"] && !latencyMap[customLocationName]) {
    latencyMap[customLocationName] = latencyMap["us-east-1"];
  }

  // Ensure skill is a number for GameLift AttributeValue
  const player: Player = {
    PlayerId: playerId,
    PlayerAttributes: {
      skill: { N: skill },
      username: { S: username },
    },
    LatencyInMs: latencyMap,
  };

  if (team) {
    player.Team = team;
  }

  return player;
}
