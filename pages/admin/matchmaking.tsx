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
  raw?: any;
}

export default function MatchmakingAdmin() {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [logs, setLogs] = useState<string[]>(["Web Console Ready..."]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
                  <div style={styles.row}>
                    <span style={styles.label}>SESSION ARN</span>
                    <code style={styles.codeBlock}>{evt.gameSessionArn}</code>
                  </div>
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
};
