import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";

const client = new SQSClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const QUEUE_URL = process.env.MATCHMAKING_QUEUE_URL || "";

export interface MatchmakingEvent {
  messageId: string;
  gameSessionArn: string;
  players: any[];
  timestamp: string;
  type: string;
  raw: any;
}

export interface PollResult {
  events: MatchmakingEvent[];
  logs: string[];
}

/**
 * Polls the SQS queue for a batch of messages.
 * This is designed to be called by an API route (short-lived).
 * For a continuous background worker, wrap this in a loop.
 */
export async function pollMatchmakingQueueOnce(): Promise<PollResult> {
  if (!QUEUE_URL) {
    console.warn("MATCHMAKING_QUEUE_URL is not set.");
    return { events: [], logs: ["Error: MATCHMAKING_QUEUE_URL not set"] };
  }

  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5, // Short wait for API responsiveness (max is 20)
    });

    const response = await client.send(command);
    const messages = response.Messages || [];
    const events: MatchmakingEvent[] = [];
    const logs: string[] = [];

    for (const message of messages) {
      try {
        if (!message.Body) continue;

        // 1. Parse body (could be Raw GameLift JSON, SNS Wrapper, or Garbage)
        let gameLiftEvent;
        try {
          gameLiftEvent = JSON.parse(message.Body);
        } catch (e) {
          const msg = `[SQS] Skipped non-JSON message: ${message.Body.substring(
            0,
            50
          )}...`;
          console.warn(msg);
          logs.push(msg); // Add to return logs

          // We still want to delete it so it doesn't block the queue
          await client.send(
            new DeleteMessageCommand({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            })
          );
          continue;
        }

        // 2. Handle SNS Wrapper (if Raw Message Delivery is OFF)
        // SNS Wrappers typically have Type="Notification" and a specific MessageId
        if (gameLiftEvent.Type === "Notification" && gameLiftEvent.Message) {
          try {
            gameLiftEvent = JSON.parse(gameLiftEvent.Message);
          } catch (e) {
            console.warn("Failed to parse inner SNS message, using body as is");
          }
        }

        // 3. Process ALL Matchmaking Events
        if (gameLiftEvent.detail && gameLiftEvent.detail.type) {
          const matchData = gameLiftEvent.detail;
          // If it's a success, use the GameSession ARN. If it's searching/timeout, use the ticketId as a reference.
          const referenceId =
            matchData.gameSessionInfo?.gameSessionArn ||
            matchData.tickets?.[0]?.ticketId ||
            "unknown";

          events.push({
            messageId: message.MessageId || "unknown",
            gameSessionArn: referenceId,
            players:
              matchData.gameSessionInfo?.players ||
              matchData.tickets?.[0]?.players ||
              [],
            timestamp: gameLiftEvent.time,
            type: matchData.type,
            raw: gameLiftEvent, // Store the full event for debugging
          });

          // Log it so we can see it in the UI
          logs.push(
            `[GameLift] Event: ${matchData.type} | Ref: ${referenceId}`
          );
          console.log(`[GameLift] ${matchData.type}`);
        } else {
          // Not a standard Detail-type event? Log what we found to debug.
          logs.push(
            `[SQS] Unknown JSON format: ${JSON.stringify(
              gameLiftEvent
            ).substring(0, 100)}...`
          );
        }

        // 4. Cleanup: Delete message so it's not processed again
        // In a real production debug viewer, you might NOT want to delete them immediately
        // if you want other services to consume them. But for this specific admin tool task:
        await client.send(
          new DeleteMessageCommand({
            QueueUrl: QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
          })
        );
      } catch (err) {
        console.error("Error processing message:", err);
      }
    }

    return { events, logs };
  } catch (error: any) {
    console.error("SQS Polling Error:", error);
    return { events: [], logs: [`SQS Error: ${error.message}`] };
  }
}
