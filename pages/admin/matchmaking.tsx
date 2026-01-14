import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import FooterNav from "../../components/FooterNav";
import NavBar from "../../components/NavBar";

interface MatchEvent {
  messageId: string;
  gameSessionArn: string;
  timestamp: string;
  type: string;
  players: any[];
  configName?: string;
  ruleSetName?: string;
  ruleSetBody?: string;
  config?: {
    name?: string;
    ruleSetName?: string;
    acceptanceRequired?: boolean;
    requestTimeoutSeconds?: number;
    acceptanceTimeoutSeconds?: number;
    flexMatchMode?: string;
  };
  ticketIds?: string[];
  tickets?: Array<{
    ticketId: string;
    status?: string;
    startTime?: string;
    estimatedWaitTime?: number;
    statusReason?: string;
    statusMessage?: string;
    gameSessionArn?: string;
    latencySummary?: Array<{
      playerId?: string;
      team?: string;
      summary?: {
        top: Array<{ region: string; ms: number }>;
        customHomeOfficeMs?: number;
      };
    }>;
    raw?: any;
  }>;
  raw?: any;
}

type TicketEventHistoryItem = {
  messageId: string;
  timestamp: string;
  type: string;
  raw?: any;
};

type TicketGroup = {
  ticketId: string;
  firstSeen: string;
  lastSeen: string;
  configName?: string;
  ruleSetName?: string;
  ruleSetBody?: string;
  config?: MatchEvent["config"];
  latestTicket?: MatchEvent["tickets"][number];
  history: TicketEventHistoryItem[];
};

function maxIso(a: string, b: string) {
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

function minIso(a: string, b: string) {
  return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
}

export default function MatchmakingAdmin() {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [logs, setLogs] = useState<string[]>(["Web Console Ready..."]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTicketKey, setExpandedTicketKey] = useState<string | null>(
    null
  );
  const [showFullJson, setShowFullJson] = useState(false);
  const [copyState, setCopyState] = useState<string | null>(null);

  const fullDumpJson = useMemo(() => {
    return JSON.stringify({ logs, events }, null, 2);
  }, [logs, events]);

  const copyFullJson = async () => {
    try {
      const text = fullDumpJson;
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback: temporary textarea
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopyState("Copied!");
      setTimeout(() => setCopyState(null), 1200);
    } catch (e) {
      setCopyState("Copy failed");
      setTimeout(() => setCopyState(null), 1600);
    }
  };

  const groupedTickets = useMemo(() => {
    // ticketId -> group
    const map = new Map<string, TicketGroup>();
    const seenPerTicket = new Map<string, Set<string>>();

    for (const evt of events) {
      const ticketIds: string[] =
        evt.tickets?.map((t) => t.ticketId).filter(Boolean) ||
        evt.ticketIds?.filter(Boolean) ||
        [];

      if (ticketIds.length === 0) continue;

      for (const ticketId of ticketIds) {
        if (!ticketId) continue;

        let group = map.get(ticketId);
        if (!group) {
          group = {
            ticketId,
            firstSeen: evt.timestamp,
            lastSeen: evt.timestamp,
            configName: evt.configName,
            ruleSetName: evt.ruleSetName,
            ruleSetBody: evt.ruleSetBody,
            config: evt.config,
            latestTicket: undefined,
            history: [],
          };
          map.set(ticketId, group);
          seenPerTicket.set(ticketId, new Set());
        }

        group.firstSeen = minIso(group.firstSeen, evt.timestamp);
        group.lastSeen = maxIso(group.lastSeen, evt.timestamp);

        // Keep metadata from the most recent event.
        if (
          new Date(evt.timestamp).getTime() >=
          new Date(group.lastSeen).getTime()
        ) {
          group.configName = evt.configName || group.configName;
          group.ruleSetName = evt.ruleSetName || group.ruleSetName;
          group.ruleSetBody = evt.ruleSetBody || group.ruleSetBody;
          group.config = evt.config || group.config;
        }

        const dedupeKey = `${evt.messageId}`;
        const seen = seenPerTicket.get(ticketId)!;
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          group.history.push({
            messageId: evt.messageId,
            timestamp: evt.timestamp,
            type: evt.type,
            raw: evt.raw,
          });
        }

        // If this event has an enriched ticket snapshot, treat the most recent one as "current".
        const enriched = evt.tickets?.find((t) => t.ticketId === ticketId);
        if (enriched) {
          const currentTs = new Date(group.lastSeen).getTime();
          const evtTs = new Date(evt.timestamp).getTime();
          const latestTicketTs = group.latestTicket ? evtTs : -Infinity;
          // We want the ticket snapshot from the newest event we have for this ticket.
          if (
            !group.latestTicket ||
            evtTs >= currentTs ||
            evtTs >= latestTicketTs
          ) {
            group.latestTicket = enriched;
          }
        }
      }
    }

    const arr = Array.from(map.values());
    // Sort by most recent activity
    arr.sort(
      (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );

    // Sort each ticket's history by time ascending for readability
    for (const g of arr) {
      g.history.sort(
        (x, y) =>
          new Date(x.timestamp).getTime() - new Date(y.timestamp).getTime()
      );
    }

    return arr;
  }, [events]);

  const addLog = (msg: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 99),
    ]);
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/matchmaking/events");
      const data = await res.json();

      if (data.logs && data.logs.length > 0) {
        data.logs.forEach((log: string) => addLog(log));
      }

      if (data.events && data.events.length > 0) {
        setEvents((prev) => [...data.events, ...prev]);
        addLog(`Received ${data.events.length} new match events!`);
      }
    } catch (err) {
      console.error(err);
      addLog("Error fetching events");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling) {
      addLog("Started Polling SQS...");
      interval = setInterval(fetchEvents, 6000);
      fetchEvents();
    } else {
      addLog("Polling Stopped.");
    }
    return () => clearInterval(interval);
  }, [isPolling]);

  return (
    <div style={styles.page}>
      <Head>
        <title>Matchmaking Admin | Thang</title>
      </Head>
      <NavBar />

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>AWS Matchmaking Monitor</h1>
          <div style={styles.headerButtons}>
            <button
              onClick={() => setShowFullJson((v) => !v)}
              style={styles.detailBtn}
            >
              {showFullJson ? "Hide Full JSON" : "View Full JSON"}
            </button>
            <button onClick={copyFullJson} style={styles.detailBtn}>
              {copyState ? copyState : "Copy JSON"}
            </button>
            <button
              onClick={() => setIsPolling(!isPolling)}
              style={isPolling ? styles.stopBtn : styles.startBtn}
            >
              {isPolling ? "Stop Polling" : "Start Live Monitor"}
            </button>
          </div>
        </div>

        <div style={styles.layout}>
          {/* LEFT: Live Log */}
          <div style={styles.logBox}>
            {logs.map((log, i) => (
              <div key={i} style={styles.logEntry}>
                {log}
              </div>
            ))}
          </div>

          {/* RIGHT: Match Events */}
          <div style={styles.eventsBox}>
            {showFullJson && (
              <div style={styles.eventCard}>
                <div style={styles.eventHeader}>
                  <span>Export</span>
                  <span style={styles.eventType}>FULL JSON</span>
                </div>
                <pre style={{ ...styles.jsonBlock, maxHeight: 520 }}>
                  {fullDumpJson}
                </pre>
              </div>
            )}
            {groupedTickets.length === 0 ? (
              <div style={styles.emptyState}>Waiting for matches...</div>
            ) : (
              groupedTickets.map((g) => {
                const t = g.latestTicket;
                const playersCount =
                  (t?.raw as any)?.Players?.length ??
                  t?.latencySummary?.length ??
                  0;

                return (
                  <div key={g.ticketId} style={styles.eventCard}>
                    <div style={styles.eventHeader}>
                      <span>{new Date(g.lastSeen).toLocaleString()}</span>
                      <span style={styles.eventType}>TICKET</span>
                    </div>

                    <div style={styles.row}>
                      <span style={styles.label}>TICKET ID</span>
                      <code style={styles.codeBlock}>{g.ticketId}</code>
                    </div>

                    {(g.configName || g.ruleSetName) && (
                      <div style={styles.row}>
                        <span style={styles.label}>CONFIG / RULE SET</span>
                        <div style={styles.metaGrid}>
                          {g.configName && (
                            <div>
                              <span style={styles.metaKey}>Config</span>
                              <code style={styles.metaValue}>
                                {g.configName}
                              </code>
                            </div>
                          )}
                          {g.ruleSetName && (
                            <div>
                              <span style={styles.metaKey}>RuleSet</span>
                              <code style={styles.metaValue}>
                                {g.ruleSetName}
                              </code>
                            </div>
                          )}
                          {g.config?.requestTimeoutSeconds !== undefined && (
                            <div>
                              <span style={styles.metaKey}>RequestTimeout</span>
                              <span style={styles.metaText}>
                                {g.config.requestTimeoutSeconds}s
                              </span>
                            </div>
                          )}
                          {g.config?.acceptanceRequired !== undefined && (
                            <div>
                              <span style={styles.metaKey}>
                                AcceptanceRequired
                              </span>
                              <span style={styles.metaText}>
                                {String(g.config.acceptanceRequired)}
                              </span>
                            </div>
                          )}
                          {g.config?.acceptanceTimeoutSeconds !== undefined && (
                            <div>
                              <span style={styles.metaKey}>
                                AcceptanceTimeout
                              </span>
                              <span style={styles.metaText}>
                                {g.config.acceptanceTimeoutSeconds}s
                              </span>
                            </div>
                          )}
                        </div>

                        {g.ruleSetBody && (
                          <div style={{ marginTop: 8 }}>
                            <button
                              onClick={() =>
                                setExpandedId(
                                  expandedId === `${g.ticketId}::rules`
                                    ? null
                                    : `${g.ticketId}::rules`
                                )
                              }
                              style={styles.detailBtn}
                            >
                              {expandedId === `${g.ticketId}::rules`
                                ? "Hide Rule Set"
                                : "View Rule Set"}
                            </button>
                            {expandedId === `${g.ticketId}::rules` && (
                              <pre style={styles.jsonBlock}>
                                {g.ruleSetBody}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={styles.row}>
                      <span style={styles.label}>STATUS</span>
                      <div style={styles.ticketTopRow}>
                        <span style={styles.ticketStatus}>
                          {t?.status || "UNKNOWN"}
                        </span>
                        <span style={{ color: "#6b7280", fontSize: 12 }}>
                          firstSeen:{" "}
                          {new Date(g.firstSeen).toLocaleTimeString()} ·
                          lastSeen: {new Date(g.lastSeen).toLocaleTimeString()}
                        </span>
                      </div>

                      {t?.gameSessionArn && (
                        <div style={styles.ticketMeta}>
                          <span style={styles.ticketMetaLabel}>
                            GameSessionArn:
                          </span>
                          <code style={styles.ticketMetaValue}>
                            {t.gameSessionArn}
                          </code>
                        </div>
                      )}

                      {(t?.statusReason || t?.statusMessage) && (
                        <div style={styles.ticketMeta}>
                          <span style={styles.ticketMetaLabel}>Reason:</span>
                          <span style={styles.ticketMetaText}>
                            {t.statusReason || t.statusMessage}
                          </span>
                        </div>
                      )}
                    </div>

                    {t?.latencySummary && t.latencySummary.length > 0 && (
                      <div style={styles.row}>
                        <span style={styles.label}>LATENCY</span>
                        <div style={styles.latencyBox}>
                          {t.latencySummary.map((ls, i) => (
                            <div key={i} style={styles.latencyRow}>
                              <span style={styles.latencyPlayer}>
                                {ls.playerId || "player"}
                                {ls.team ? ` (${ls.team})` : ""}
                              </span>
                              <span style={styles.latencyValues}>
                                {ls.summary?.top
                                  ?.map((x) => `${x.region}:${x.ms}ms`)
                                  .join(" | ") || "no latency"}
                                {ls.summary?.customHomeOfficeMs !== undefined &&
                                  ` | custom-home-office:${ls.summary.customHomeOfficeMs}ms`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={styles.row}>
                      <span style={styles.label}>
                        HISTORY ({g.history.length}) / PLAYERS ({playersCount})
                      </span>
                      <div style={styles.historyBox}>
                        {g.history.map((h) => (
                          <div key={h.messageId} style={styles.historyRow}>
                            <span style={styles.historyTime}>
                              {new Date(h.timestamp).toLocaleTimeString()}
                            </span>
                            <span style={styles.historyType}>{h.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DETAIL TOGGLES */}
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      {t?.raw && (
                        <button
                          onClick={() =>
                            setExpandedTicketKey(
                              expandedTicketKey === `${g.ticketId}::ticket`
                                ? null
                                : `${g.ticketId}::ticket`
                            )
                          }
                          style={styles.detailBtn}
                        >
                          {expandedTicketKey === `${g.ticketId}::ticket`
                            ? "Hide Ticket JSON"
                            : "View Ticket JSON"}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setExpandedId(
                            expandedId === `${g.ticketId}::events`
                              ? null
                              : `${g.ticketId}::events`
                          )
                        }
                        style={styles.detailBtn}
                      >
                        {expandedId === `${g.ticketId}::events`
                          ? "Hide Event JSON"
                          : "View Event JSON"}
                      </button>
                    </div>

                    {expandedTicketKey === `${g.ticketId}::ticket` &&
                      t?.raw && (
                        <pre style={styles.jsonBlock}>
                          {JSON.stringify(t.raw, null, 2)}
                        </pre>
                      )}

                    {expandedId === `${g.ticketId}::events` && (
                      <pre style={styles.jsonBlock}>
                        {JSON.stringify(
                          g.history.map((h) => ({
                            messageId: h.messageId,
                            timestamp: h.timestamp,
                            type: h.type,
                            raw: h.raw,
                          })),
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <FooterNav />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#000",
    color: "#4ade80",
    //fontFamily: "monospace",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "100px 20px 32px", // Matches NavBar inner padding
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    borderBottom: "1px solid #166534",
    paddingBottom: "16px",
  },
  headerButtons: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
  },
  startBtn: {
    padding: "8px 24px",
    border: "1px solid #22c55e",
    color: "#22c55e",
    background: "transparent",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  stopBtn: {
    padding: "8px 24px",
    border: "1px solid #ef4444",
    color: "#ef4444",
    background: "transparent",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  layout: {
    display: "flex",
    gap: "24px",
    flexDirection: "row", // simplified, assuming desktop
    height: "600px",
  },
  logBox: {
    flex: "1",
    backgroundColor: "#111827",
    border: "1px solid #374151",
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column-reverse",
    borderRadius: "4px",
    maxWidth: "350px",
  },
  logEntry: {
    fontSize: "12px",
    marginBottom: "4px",
    opacity: 0.8,
  },
  eventsBox: {
    flex: "2",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    paddingRight: "8px",
  },
  emptyState: {
    textAlign: "center",
    color: "#4b5563",
    marginTop: "80px",
  },
  eventCard: {
    backgroundColor: "#111827",
    border: "1px solid #14532d",
    padding: "16px",
    borderRadius: "4px",
  },
  eventHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "8px",
    color: "#9ca3af",
  },
  eventType: {
    color: "#86efac",
    fontWeight: "bold",
  },
  row: {
    marginBottom: "8px",
  },
  label: {
    fontSize: "10px",
    color: "#6b7280",
    display: "block",
    marginBottom: "4px",
    textTransform: "uppercase",
  },
  codeBlock: {
    fontSize: "12px",
    color: "#93c5fd",
    wordBreak: "break-all",
  },
  playerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  playerBadge: {
    backgroundColor: "#000",
    padding: "8px",
    fontSize: "12px",
    display: "flex",
    justifyContent: "space-between",
    borderRadius: "4px",
  },
  sessionId: {
    color: "#6b7280",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100px",
    textAlign: "right",
  } as React.CSSProperties,
  detailBtn: {
    background: "transparent",
    border: "1px solid #374151",
    color: "#9ca3af",
    fontSize: "10px",
    padding: "4px 8px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  jsonBlock: {
    marginTop: "8px",
    padding: "8px",
    backgroundColor: "#000",
    border: "1px solid #374151",
    borderRadius: "4px",
    fontSize: "10px",
    color: "#d1d5db",
    overflowX: "auto",
    maxHeight: "300px",
  },

  ticketList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  ticketItem: {
    backgroundColor: "#000",
    border: "1px solid #374151",
    padding: "8px",
    borderRadius: "4px",
  },
  historyBox: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    backgroundColor: "#000",
    border: "1px solid #374151",
    borderRadius: "4px",
    padding: "8px",
  },
  historyRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    fontSize: "11px",
    color: "#d1d5db",
  },
  historyTime: {
    color: "#6b7280",
    width: "86px",
    flexShrink: 0,
  },
  historyType: {
    color: "#86efac",
    fontWeight: 700,
  },
  ticketTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  ticketId: {
    fontSize: "12px",
    color: "#93c5fd",
    wordBreak: "break-all",
  },
  ticketStatus: {
    fontSize: "10px",
    color: "#86efac",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
  },
  ticketMeta: {
    marginTop: "6px",
    fontSize: "10px",
    color: "#9ca3af",
    wordBreak: "break-word",
  },
  ticketMetaLabel: {
    color: "#6b7280",
    marginRight: "6px",
    textTransform: "uppercase",
  },
  ticketMetaValue: {
    color: "#93c5fd",
    wordBreak: "break-all",
  },
  ticketMetaText: {
    color: "#d1d5db",
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  metaKey: {
    fontSize: "10px",
    color: "#6b7280",
    display: "block",
    textTransform: "uppercase",
    marginBottom: "2px",
  },
  metaValue: {
    fontSize: "12px",
    color: "#93c5fd",
    wordBreak: "break-all",
  },
  metaText: {
    fontSize: "12px",
    color: "#d1d5db",
    wordBreak: "break-word",
  },

  latencyBox: {
    marginTop: "6px",
    border: "1px solid #374151",
    borderRadius: "4px",
    padding: "6px",
    backgroundColor: "#000",
  },
  latencyRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "4px",
  },
  latencyPlayer: {
    color: "#9ca3af",
    fontSize: "10px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "140px",
  },
  latencyValues: {
    color: "#d1d5db",
    fontSize: "10px",
    wordBreak: "break-word",
    textAlign: "right",
  },
};
