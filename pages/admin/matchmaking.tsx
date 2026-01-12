import React, { useEffect, useState } from "react";
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

export default function MatchmakingAdmin() {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [logs, setLogs] = useState<string[]>(["Web Console Ready..."]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTicketKey, setExpandedTicketKey] = useState<string | null>(
    null
  );

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
          <button
            onClick={() => setIsPolling(!isPolling)}
            style={isPolling ? styles.stopBtn : styles.startBtn}
          >
            {isPolling ? "Stop Polling" : "Start Live Monitor"}
          </button>
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
            {events.length === 0 ? (
              <div style={styles.emptyState}>Waiting for matches...</div>
            ) : (
              events.map((evt) => (
                <div key={evt.messageId} style={styles.eventCard}>
                  <div style={styles.eventHeader}>
                    <span>{new Date(evt.timestamp).toLocaleString()}</span>
                    <span style={styles.eventType}>{evt.type}</span>
                  </div>

                  {(evt.configName || evt.ruleSetName) && (
                    <div style={styles.row}>
                      <span style={styles.label}>CONFIG / RULE SET</span>
                      <div style={styles.metaGrid}>
                        {evt.configName && (
                          <div>
                            <span style={styles.metaKey}>Config</span>
                            <code style={styles.metaValue}>
                              {evt.configName}
                            </code>
                          </div>
                        )}
                        {evt.ruleSetName && (
                          <div>
                            <span style={styles.metaKey}>RuleSet</span>
                            <code style={styles.metaValue}>
                              {evt.ruleSetName}
                            </code>
                          </div>
                        )}
                        {evt.config?.requestTimeoutSeconds !== undefined && (
                          <div>
                            <span style={styles.metaKey}>RequestTimeout</span>
                            <span style={styles.metaText}>
                              {evt.config.requestTimeoutSeconds}s
                            </span>
                          </div>
                        )}
                        {evt.config?.acceptanceRequired !== undefined && (
                          <div>
                            <span style={styles.metaKey}>
                              AcceptanceRequired
                            </span>
                            <span style={styles.metaText}>
                              {String(evt.config.acceptanceRequired)}
                            </span>
                          </div>
                        )}
                        {evt.config?.acceptanceTimeoutSeconds !== undefined && (
                          <div>
                            <span style={styles.metaKey}>
                              AcceptanceTimeout
                            </span>
                            <span style={styles.metaText}>
                              {evt.config.acceptanceTimeoutSeconds}s
                            </span>
                          </div>
                        )}
                      </div>

                      {evt.ruleSetBody && (
                        <div style={{ marginTop: 8 }}>
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === `${evt.messageId}::rules`
                                  ? null
                                  : `${evt.messageId}::rules`
                              )
                            }
                            style={styles.detailBtn}
                          >
                            {expandedId === `${evt.messageId}::rules`
                              ? "Hide Rule Set"
                              : "View Rule Set"}
                          </button>
                          {expandedId === `${evt.messageId}::rules` && (
                            <pre style={styles.jsonBlock}>
                              {evt.ruleSetBody}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={styles.row}>
                    <span style={styles.label}>
                      REFERENCE (SESSION ARN OR TICKET)
                    </span>
                    <code style={styles.codeBlock}>{evt.gameSessionArn}</code>
                  </div>

                  {evt.tickets && evt.tickets.length > 0 && (
                    <div style={styles.row}>
                      <span style={styles.label}>
                        TICKETS ({evt.tickets.length})
                      </span>
                      <div style={styles.ticketList}>
                        {evt.tickets.map((t) => (
                          <div key={t.ticketId} style={styles.ticketItem}>
                            <div style={styles.ticketTopRow}>
                              <code style={styles.ticketId}>{t.ticketId}</code>
                              {t.status && (
                                <span style={styles.ticketStatus}>
                                  {t.status}
                                </span>
                              )}
                            </div>

                            {t.gameSessionArn && (
                              <div style={styles.ticketMeta}>
                                <span style={styles.ticketMetaLabel}>
                                  GameSessionArn:
                                </span>
                                <code style={styles.ticketMetaValue}>
                                  {t.gameSessionArn}
                                </code>
                              </div>
                            )}

                            {(t.statusReason || t.statusMessage) && (
                              <div style={styles.ticketMeta}>
                                <span style={styles.ticketMetaLabel}>
                                  Reason:
                                </span>
                                <span style={styles.ticketMetaText}>
                                  {t.statusReason || t.statusMessage}
                                </span>
                              </div>
                            )}

                            {t.latencySummary &&
                              t.latencySummary.length > 0 && (
                                <div style={styles.ticketMeta}>
                                  <span style={styles.ticketMetaLabel}>
                                    Latency:
                                  </span>
                                  <div style={styles.latencyBox}>
                                    {t.latencySummary.map((ls, i) => (
                                      <div key={i} style={styles.latencyRow}>
                                        <span style={styles.latencyPlayer}>
                                          {ls.playerId || "player"}
                                          {ls.team ? ` (${ls.team})` : ""}
                                        </span>
                                        <span style={styles.latencyValues}>
                                          {ls.summary?.top
                                            ?.map(
                                              (x) => `${x.region}:${x.ms}ms`
                                            )
                                            .join(" | ") || "no latency"}
                                          {ls.summary?.customHomeOfficeMs !==
                                            undefined &&
                                            ` | custom-home-office:${ls.summary.customHomeOfficeMs}ms`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {t.raw && (
                              <div style={{ marginTop: 8 }}>
                                <button
                                  onClick={() =>
                                    setExpandedTicketKey(
                                      expandedTicketKey ===
                                        `${evt.messageId}::${t.ticketId}`
                                        ? null
                                        : `${evt.messageId}::${t.ticketId}`
                                    )
                                  }
                                  style={styles.detailBtn}
                                >
                                  {expandedTicketKey ===
                                  `${evt.messageId}::${t.ticketId}`
                                    ? "Hide Ticket JSON"
                                    : "View Ticket JSON"}
                                </button>
                                {expandedTicketKey ===
                                  `${evt.messageId}::${t.ticketId}` && (
                                  <pre style={styles.jsonBlock}>
                                    {JSON.stringify(t.raw, null, 2)}
                                  </pre>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span style={styles.label}>
                      PLAYERS ({evt.players.length})
                    </span>
                    <div style={styles.playerGrid}>
                      {evt.players.map((p: any, idx: number) => (
                        <div key={idx} style={styles.playerBadge}>
                          <span style={{ color: "#fff" }}>{p.playerId}</span>
                          {p.playerSessionId && (
                            <span style={styles.sessionId}>
                              {p.playerSessionId}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* DETAIL TOGGLE */}
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === evt.messageId ? null : evt.messageId
                        )
                      }
                      style={styles.detailBtn}
                    >
                      {expandedId === evt.messageId
                        ? "Hide JSON"
                        : "View Raw JSON"}
                    </button>
                    {expandedId === evt.messageId && (
                      <pre style={styles.jsonBlock}>
                        {JSON.stringify(evt.raw, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))
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
