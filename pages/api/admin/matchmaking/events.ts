import type { NextApiRequest, NextApiResponse } from "next";
import { pollMatchmakingQueueOnce } from "@/lib/sqsListener";
import admin from "@/lib/firebaseAdmin";
import {
  GameLiftClient,
  DescribeMatchmakingCommand,
  DescribeMatchmakingConfigurationsCommand,
  DescribeMatchmakingRuleSetsCommand,
} from "@aws-sdk/client-gamelift";

const gameLiftClient = new GameLiftClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

function extractTicketIds(raw: any): string[] {
  const tickets = raw?.detail?.tickets;
  if (!Array.isArray(tickets)) return [];
  return tickets
    .map((t: any) => t?.ticketId)
    .filter((t: any) => typeof t === "string" && t.length > 0);
}

function extractConfigName(raw: any): string | undefined {
  const resources = raw?.resources;
  if (!Array.isArray(resources)) return undefined;

  for (const r of resources) {
    if (typeof r !== "string") continue;
    // arn:aws:gamelift:REGION:ACCT:matchmakingconfiguration/NAME
    const marker = ":matchmakingconfiguration/";
    const idx = r.indexOf(marker);
    if (idx === -1) continue;
    const name = r.substring(idx + marker.length);
    return name || undefined;
  }

  return undefined;
}

async function describeMatchmakingTickets(ticketIds: string[]) {
  const unique = Array.from(new Set(ticketIds));
  const results = new Map<string, any>();

  // GameLift DescribeMatchmaking supports multiple ticket ids; keep batches small.
  const batchSize = 10;
  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize);
    const resp = await gameLiftClient.send(
      new DescribeMatchmakingCommand({ TicketIds: batch })
    );
    for (const t of resp.TicketList || []) {
      if (t?.TicketId) {
        results.set(t.TicketId, t);
      }
    }
  }

  return results;
}

async function describeConfigsByName(configNames: string[]) {
  const unique = Array.from(
    new Set(configNames.filter((n) => typeof n === "string" && n.length > 0))
  );
  const map = new Map<string, any>();
  if (unique.length === 0) return map;

  const resp = await gameLiftClient.send(
    new DescribeMatchmakingConfigurationsCommand({ Names: unique })
  );
  for (const cfg of resp.Configurations || []) {
    if (cfg?.Name) map.set(cfg.Name, cfg);
  }
  return map;
}

async function describeRuleSetsByName(ruleSetNames: string[]) {
  const unique = Array.from(
    new Set(ruleSetNames.filter((n) => typeof n === "string" && n.length > 0))
  );
  const map = new Map<string, any>();
  if (unique.length === 0) return map;

  const resp = await gameLiftClient.send(
    new DescribeMatchmakingRuleSetsCommand({ Names: unique })
  );
  for (const rs of resp.RuleSets || []) {
    const name = (rs as any)?.Name || (rs as any)?.name;
    if (name) map.set(name, rs);
  }
  return map;
}

function summarizeLatencies(
  latencyInMs: any
):
  | { top: Array<{ region: string; ms: number }>; customHomeOfficeMs?: number }
  | undefined {
  if (!latencyInMs || typeof latencyInMs !== "object") return undefined;

  const entries: Array<{ region: string; ms: number }> = [];
  for (const [region, ms] of Object.entries(latencyInMs)) {
    const num = Number(ms);
    if (!region || Number.isNaN(num)) continue;
    entries.push({ region, ms: num });
  }
  if (entries.length === 0) return undefined;

  entries.sort((a, b) => a.ms - b.ms);
  const top = entries.slice(0, 3);
  const customHomeOffice = entries.find(
    (e) => e.region === "custom-home-office"
  );
  return {
    top,
    customHomeOfficeMs: customHomeOffice?.ms,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Optional: Add Admin Authorization here
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // For now, allow unauthorized access strictly for local dev/demo based on prompt "make a nice /admin page"
    // In prod, uncomment:
    // return res.status(401).json({ error: "Missing authorization header" });
  }

  try {
    const { events, logs } = await pollMatchmakingQueueOnce();

    const configNames: string[] = [];
    for (const evt of events) {
      const cfgName = extractConfigName(evt.raw);
      if (cfgName) configNames.push(cfgName);
    }

    let configMap = new Map<string, any>();
    try {
      configMap = await describeConfigsByName(configNames);
    } catch (e: any) {
      logs.push(
        `[Admin] DescribeMatchmakingConfigurations failed: ${
          e?.message || String(e)
        }`
      );
    }

    const ruleSetNames: string[] = [];
    for (const cfgName of configNames) {
      const cfg = configMap.get(cfgName);
      if (cfg?.RuleSetName) ruleSetNames.push(cfg.RuleSetName);
    }

    let ruleSetMap = new Map<string, any>();
    try {
      ruleSetMap = await describeRuleSetsByName(ruleSetNames);
    } catch (e: any) {
      logs.push(
        `[Admin] DescribeMatchmakingRuleSets failed: ${e?.message || String(e)}`
      );
    }

    const allTicketIds: string[] = [];
    for (const evt of events) {
      allTicketIds.push(...extractTicketIds(evt.raw));
    }

    let ticketMap = new Map<string, any>();
    if (allTicketIds.length > 0) {
      try {
        ticketMap = await describeMatchmakingTickets(allTicketIds);
      } catch (e: any) {
        logs.push(
          `[Admin] DescribeMatchmaking failed: ${e?.message || String(e)}`
        );
      }
    }

    const enrichedEvents = events.map((evt) => {
      const configName = extractConfigName(evt.raw);
      const cfg = configName ? configMap.get(configName) : undefined;
      const ruleSetName: string | undefined = cfg?.RuleSetName;
      const ruleSet = ruleSetName ? ruleSetMap.get(ruleSetName) : undefined;

      const ticketIds = extractTicketIds(evt.raw);
      const tickets = ticketIds
        .map((id) => {
          const t = ticketMap.get(id);
          if (!t) return { ticketId: id };

          const players = Array.isArray((t as any).Players)
            ? (t as any).Players
            : [];

          return {
            ticketId: id,
            status: t.Status,
            startTime: t.StartTime,
            estimatedWaitTime: t.EstimatedWaitTime,
            statusReason: (t as any).StatusReason,
            statusMessage: (t as any).StatusMessage,
            gameSessionArn: (t as any).GameSessionArn,
            latencySummary: players.map((p: any) => ({
              playerId: p?.PlayerId,
              team: p?.Team,
              summary: summarizeLatencies(p?.LatencyInMs),
            })),
            raw: t,
          };
        })
        .filter(Boolean);

      return {
        ...evt,
        configName,
        ruleSetName,
        ruleSetBody:
          (ruleSet as any)?.RuleSetBody || (ruleSet as any)?.ruleSetBody,
        config: cfg
          ? {
              name: cfg?.Name,
              ruleSetName: cfg?.RuleSetName,
              acceptanceRequired: cfg?.AcceptanceRequired,
              requestTimeoutSeconds: cfg?.RequestTimeoutSeconds,
              acceptanceTimeoutSeconds: cfg?.AcceptanceTimeoutSeconds,
              flexMatchMode: cfg?.FlexMatchMode,
            }
          : undefined,
        ticketIds,
        tickets,
      };
    });

    return res.status(200).json({ events: enrichedEvents, logs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
