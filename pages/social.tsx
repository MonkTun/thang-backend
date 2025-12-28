import { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface Friend {
  uid: string;
  username: string;
  status: string;
  lastSeen?: string;
  party?: {
    id: string;
    privacy: "public" | "private";
    isFull: boolean;
  };
}

interface FriendRequest {
  uid: string;
  username: string;
  type: "incoming" | "outgoing";
}

interface BlockedUser {
  uid: string;
  blockedAt: string;
}

interface PartyMember {
  uid: string;
  username: string;
  joinedAt: string;
}

interface Party {
  _id: string;
  leaderUid: string;
  members: PartyMember[];
  privacy: "public" | "private";
}

interface PartyInvite {
  partyId: string;
  leaderUsername: string;
  invitedAt: string;
}

export default function SocialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Friends State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [targetUsername, setTargetUsername] = useState("");
  const [friendError, setFriendError] = useState<string | null>(null);
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null);

  // Party State
  const [party, setParty] = useState<Party | null>(null);
  const [partyInvites, setPartyInvites] = useState<PartyInvite[]>([]);
  const [partyTargetUsername, setPartyTargetUsername] = useState("");
  const [partyError, setPartyError] = useState<string | null>(null);
  const [partySuccess, setPartySuccess] = useState<string | null>(null);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  // Matchmaking State
  const [matchmakingStatus, setMatchmakingStatus] = useState<
    "IDLE" | "QUEUED" | "PLACING" | "COMPLETED" | "FAILED"
  >("IDLE");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [availableConfigs, setAvailableConfigs] = useState<any[]>([]);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(
    null
  );
  const [matchResult, setMatchResult] = useState<any>(null);
  const [configsLoading, setConfigsLoading] = useState(false);
  const [matchmakingError, setMatchmakingError] = useState<string | null>(null);

  // 1. Auth Check & Initial Data
  useEffect(() => {
    const init = async () => {
      const idToken = localStorage.getItem("idToken");
      const uid = localStorage.getItem("uid");

      if (!idToken || !uid) {
        router.push("/login");
        return;
      }

      setCurrentUserUid(uid);
      setLoading(false);
      fetchFriends();
      fetchPartyStatus();
      fetchRegion();
      fetchMatchmakingConfigs();
    };
    init();
  }, [router]);

  const fetchMatchmakingConfigs = async () => {
    setConfigsLoading(true);
    try {
      const idToken = localStorage.getItem("idToken");
      const res = await fetch("/api/matchmaking/configs", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("[Social] Matchmaking Configs:", data);
        setAvailableConfigs(data.configs || []);
        if (data.configs && data.configs.length > 0) {
          setSelectedConfig(data.configs[0].name);
        }
      } else {
        console.warn("[Social] Failed to fetch configs:", res.status);
      }
    } catch (err) {
      console.error("Failed to fetch matchmaking configs", err);
    } finally {
      setConfigsLoading(false);
    }
  }; // Matchmaking Polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (
      (matchmakingStatus === "QUEUED" || matchmakingStatus === "PLACING") &&
      ticketId
    ) {
      pollInterval = setInterval(async () => {
        try {
          const idToken = localStorage.getItem("idToken");
          const res = await fetch(
            `/api/matchmaking/status?ticketId=${ticketId}`,
            {
              headers: { Authorization: `Bearer ${idToken}` },
            }
          );
          const data = await res.json();

          if (data.status === "COMPLETED") {
            setMatchmakingStatus("COMPLETED");
            setMatchResult(data);
            clearInterval(pollInterval);
          } else if (data.status === "PLACING") {
            setMatchmakingStatus("PLACING");
          } else if (data.status === "FAILED" || data.status === "TIMED_OUT") {
            setMatchmakingStatus("FAILED");
            setMatchmakingError(`Matchmaking failed: ${data.status}`);
            clearInterval(pollInterval);
          } else {
            // Still queuing
            if (data.estimatedWaitTime) {
              setEstimatedWaitTime(data.estimatedWaitTime);
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [matchmakingStatus, ticketId]);

  const handleStartMatchmaking = async () => {
    setMatchmakingError(null);
    setMatchmakingStatus("QUEUED");
    setMatchResult(null);

    try {
      const idToken = localStorage.getItem("idToken");
      const res = await fetch("/api/matchmaking/queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          configName: selectedConfig,
          latencyMap: selectedRegion ? { [selectedRegion]: 50 } : {}, // Mock latency for now
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start matchmaking");
      }

      setTicketId(data.ticketId);
      if (data.estimatedWaitTime) {
        setEstimatedWaitTime(data.estimatedWaitTime);
      }
    } catch (err: any) {
      setMatchmakingStatus("FAILED");
      setMatchmakingError(err.message);
    }
  };

  const handleCancelMatchmaking = async () => {
    if (!ticketId) return;
    setMatchmakingError(null);

    try {
      const idToken = localStorage.getItem("idToken");
      await fetch("/api/matchmaking/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ ticketId }),
      });
      setMatchmakingStatus("IDLE");
      setTicketId(null);
    } catch (err: any) {
      console.error("Failed to cancel matchmaking:", err);
      setMatchmakingError("Failed to cancel matchmaking");
    }
  };

  const fetchRegion = async () => {
    try {
      const res = await fetch("/api/region");
      if (res.ok) {
        const data = await res.json();
        console.log("[Social] Region data:", data);
        if (data.regions && data.regions.length > 0) {
          setAvailableRegions(data.regions);
          setSelectedRegion(data.regions[0]);
        }
      } else {
        console.warn("[Social] Failed to fetch region:", res.status);
      }
    } catch (e) {
      console.error("Failed to fetch region", e);
    }
  };

  // 2. Heartbeat Loop (Every 30s)
  useEffect(() => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/presence/heartbeat", {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
        });
      } catch (e) {
        console.error("Heartbeat failed", e);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, []);

  // 3. Polling (Every 5s for faster updates)
  useEffect(() => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    const poll = () => {
      fetchFriends();
      fetchPartyStatus();
    };

    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- API CALLS ---

  const fetchFriends = async () => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/friends/list", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends);
        setRequests(data.friendRequests);
        setBlockedUsers(data.blocked || []);
      }
    } catch (e) {
      console.error("Fetch friends failed", e);
    }
  };

  const fetchPartyStatus = async () => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/party/status", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setParty(data.party || null);
        setPartyInvites(data.partyInvites || []);
      }
    } catch (e) {
      console.error("Fetch party failed", e);
    }
  };

  // --- FRIEND ACTIONS ---

  const handleSendFriendRequest = async () => {
    setFriendError(null);
    setFriendSuccess(null);
    const idToken = localStorage.getItem("idToken");
    if (!idToken || !targetUsername) return;

    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUsername }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFriendSuccess(`Request sent to ${targetUsername}`);
      setTargetUsername("");
      fetchFriends();
    } catch (e: any) {
      setFriendError(e.message);
    }
  };

  const handleAcceptFriendRequest = async (requesterUid: string) => {
    setFriendError(null);
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterUid }),
      });

      if (!res.ok) throw new Error("Failed to accept");
      fetchFriends();
    } catch (e: any) {
      console.error(e);
      setFriendError(e.message || "Failed to accept friend request");
    }
  };

  const handleRemoveFriend = async (targetUid: string) => {
    setFriendError(null);
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/friends/remove", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUid }),
      });
      if (!res.ok) throw new Error("Failed to remove friend");
      fetchFriends();
    } catch (e: any) {
      console.error(e);
      setFriendError(e.message || "Failed to remove friend");
    }
  };

  const handleRejectRequest = async (requesterUid: string) => {
    setFriendError(null);
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/friends/reject", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterUid }),
      });
      if (!res.ok) throw new Error("Failed to reject request");
      fetchFriends();
    } catch (e: any) {
      console.error(e);
      setFriendError(e.message || "Failed to reject friend request");
    }
  };

  const handleBlockUser = async (targetUid: string) => {
    setFriendError(null);
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/friends/block", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUid }),
      });
      if (!res.ok) throw new Error("Failed to block user");
      fetchFriends();
    } catch (e: any) {
      console.error(e);
      setFriendError(e.message || "Failed to block user");
    }
  };

  const handleUnblockUser = async (targetUid: string) => {
    setFriendError(null);
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/friends/unblock", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUid }),
      });
      if (!res.ok) throw new Error("Failed to unblock user");
      fetchFriends();
    } catch (e: any) {
      console.error(e);
      setFriendError(e.message || "Failed to unblock user");
    }
  };

  // --- PARTY ACTIONS ---

  const handleCreateParty = async () => {
    setPartyError(null);
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      const res = await fetch("/api/party/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchPartyStatus();
    } catch (e: any) {
      setPartyError(e.message);
    }
  };

  const handleLeaveParty = async () => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      await fetch("/api/party/leave", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setParty(null);
      fetchPartyStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleInviteToParty = async () => {
    setPartyError(null);
    setPartySuccess(null);
    const idToken = localStorage.getItem("idToken");
    if (!idToken || !partyTargetUsername) return;

    try {
      const res = await fetch("/api/party/invite", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUsername: partyTargetUsername }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPartySuccess(`Invited ${partyTargetUsername}`);
      setPartyTargetUsername("");
    } catch (e: any) {
      setPartyError(e.message);
    }
  };

  const handleJoinParty = async (partyId: string) => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      const res = await fetch("/api/party/join", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ partyId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchPartyStatus();
    } catch (e: any) {
      setPartyError(e.message);
    }
  };

  const handleTransferLeadership = async (targetUid: string) => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      const res = await fetch("/api/party/transfer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchPartyStatus();
    } catch (e: any) {
      setPartyError(e.message);
    }
  };

  const handleKickMember = async (targetUid: string) => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/party/kick", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchPartyStatus();
    } catch (e: any) {
      setPartyError(e.message);
    }
  };

  const handlePartySettings = async (privacy: "public" | "private") => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/party/settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ privacy }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchPartyStatus();
    } catch (e: any) {
      setPartyError(e.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ color: "#c8cbd2" }}>Loading social data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Social Hub</h1>

        {/* --- PARTY SECTION --- */}
        <h2 style={styles.sectionTitle}>Party</h2>

        {party ? (
          <div style={styles.partyBox}>
            <div style={styles.partyHeader}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ color: "#10b981", fontWeight: "bold" }}>
                  In Party
                </span>
                {selectedRegion && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      backgroundColor: "#1f2937",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {selectedRegion}
                  </span>
                )}
              </div>
              <button onClick={handleLeaveParty} style={styles.dangerButton}>
                Leave
              </button>
            </div>

            {party.leaderUid === currentUserUid && (
              <div style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#9ca3af",
                    marginRight: "8px",
                  }}
                >
                  Privacy: <b>{party.privacy || "private"}</b>
                </span>
                <button
                  onClick={() =>
                    handlePartySettings(
                      party.privacy === "public" ? "private" : "public"
                    )
                  }
                  style={styles.smallButton}
                >
                  Switch to {party.privacy === "public" ? "Private" : "Public"}
                </button>
              </div>
            )}

            <h3 style={styles.subTitle}>Members</h3>
            <div style={styles.list}>
              {party.members.map((m) => (
                <div key={m.uid} style={styles.listItem}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <span>
                      {m.username} {m.uid === party.leaderUid && "👑"}
                    </span>
                    {party.leaderUid === currentUserUid &&
                      m.uid !== currentUserUid && (
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => handleTransferLeadership(m.uid)}
                            style={styles.promoteButton}
                          >
                            Promote
                          </button>
                          <button
                            onClick={() => handleKickMember(m.uid)}
                            style={styles.dangerButton}
                          >
                            Kick
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.divider} />

            <h3 style={styles.subTitle}>Invite Player</h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Username"
                value={partyTargetUsername}
                onChange={(e) => setPartyTargetUsername(e.target.value)}
                style={styles.input}
              />
              <button onClick={handleInviteToParty} style={styles.smallButton}>
                Invite
              </button>
            </div>
            {partyError && <p style={styles.errorText}>{partyError}</p>}
            {partySuccess && <p style={styles.successText}>{partySuccess}</p>}
          </div>
        ) : (
          <div style={styles.partyBox}>
            <p style={{ color: "#9ca3af", marginBottom: "12px" }}>
              You are not in a party.
            </p>
            {availableRegions.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    marginRight: "8px",
                  }}
                >
                  Preferred Region:
                </label>
                <select
                  value={selectedRegion || ""}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  style={{
                    backgroundColor: "#1f2937",
                    color: "#e5e7eb",
                    border: "1px solid #374151",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "12px",
                  }}
                >
                  {availableRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={handleCreateParty} style={styles.button}>
              Create Party
            </button>
            {partyError && <p style={styles.errorText}>{partyError}</p>}

            {partyInvites.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={styles.subTitle}>Party Invites</h3>
                {partyInvites.map((inv) => (
                  <div key={inv.partyId} style={styles.inviteItem}>
                    <span>
                      Invited by <b>{inv.leaderUsername}</b>
                    </span>
                    <button
                      onClick={() => handleJoinParty(inv.partyId)}
                      style={styles.acceptButton}
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={styles.sectionDivider} />

        {/* --- MATCHMAKING SECTION --- */}
        <h2 style={styles.sectionTitle}>Play</h2>

        <div style={styles.partyBox}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#9ca3af",
              }}
            >
              Game Mode (Config)
            </label>
            <select
              value={selectedConfig}
              onChange={(e) => setSelectedConfig(e.target.value)}
              disabled={matchmakingStatus === "QUEUED"}
              style={{
                width: "100%",
                backgroundColor: "#1f2937",
                color: "#e5e7eb",
                border: "1px solid #374151",
                borderRadius: "4px",
                padding: "8px",
              }}
            >
              {configsLoading && <option>Loading...</option>}
              {!configsLoading && availableConfigs.length === 0 && (
                <option>No Game Modes Available</option>
              )}
              {availableConfigs.map((conf) => (
                <option key={conf.name} value={conf.name}>
                  {conf.name}
                </option>
              ))}
            </select>
          </div>

          {matchmakingError && (
            <p style={{ ...styles.errorText, marginBottom: "12px" }}>
              {matchmakingError}
            </p>
          )}

          {matchmakingStatus === "IDLE" || matchmakingStatus === "FAILED" ? (
            <button onClick={handleStartMatchmaking} style={styles.button}>
              Find Match
            </button>
          ) : matchmakingStatus === "QUEUED" ||
            matchmakingStatus === "PLACING" ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fbbf24", fontWeight: "bold" }}>
                {matchmakingStatus === "PLACING"
                  ? "Match Found! Allocating Server..."
                  : "Searching for match..."}
              </p>
              {estimatedWaitTime && matchmakingStatus === "QUEUED" && (
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                  Est. wait: {estimatedWaitTime}s
                </p>
              )}
              {matchmakingStatus === "QUEUED" && (
                <button
                  onClick={handleCancelMatchmaking}
                  style={{
                    ...styles.dangerButton,
                    marginTop: "8px",
                    width: "100%",
                  }}
                >
                  Cancel Search
                </button>
              )}
              {matchmakingStatus === "PLACING" && (
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                  Waiting for server slot...
                </p>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                backgroundColor: "#064e3b",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <p
                style={{
                  color: "#34d399",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                MATCH FOUND!
              </p>
              {matchResult?.connectionInfo && (
                <div
                  style={{
                    marginTop: "8px",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <p>
                    <b>IP:</b> {matchResult.connectionInfo.ipAddress}
                  </p>
                  <p>
                    <b>Port:</b> {matchResult.connectionInfo.port}
                  </p>
                  <p>
                    <b>Session ID:</b>{" "}
                    {matchResult.connectionInfo.playerSessionId?.substring(
                      0,
                      10
                    )}
                    ...
                  </p>
                </div>
              )}
              <button
                onClick={() => setMatchmakingStatus("IDLE")}
                style={{
                  ...styles.secondaryButton,
                  marginTop: "12px",
                  width: "100%",
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>

        <div style={styles.sectionDivider} />

        {/* --- FRIENDS SECTION --- */}
        <h2 style={styles.sectionTitle}>Friends</h2>

        {friendError && (
          <p style={{ ...styles.errorText, marginBottom: "12px" }}>
            {friendError}
          </p>
        )}

        {/* Add Friend Input */}
        <div style={styles.addFriendBox}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Enter username to add"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              style={styles.input}
            />
            <button
              onClick={handleSendFriendRequest}
              style={styles.smallButton}
            >
              Add
            </button>
          </div>
          {friendSuccess && <p style={styles.successText}>{friendSuccess}</p>}
        </div>
        {/* Pending Requests */}
        {requests.filter((r) => r.type === "incoming").length > 0 && (
          <div style={styles.requestsBox}>
            <h3 style={styles.subTitle}>Pending Requests</h3>
            {requests
              .filter((r) => r.type === "incoming")
              .map((req) => (
                <div key={req.uid} style={styles.requestItem}>
                  <span>{req.username}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleAcceptFriendRequest(req.uid)}
                      style={styles.acceptButton}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.uid)}
                      style={styles.dangerButton}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleBlockUser(req.uid)}
                      style={{ ...styles.dangerButton, background: "#4b5563" }}
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Friend List */}
        <div style={styles.friendList}>
          {friends.length === 0 ? (
            <p style={styles.emptyText}>No friends yet. Add someone!</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.uid} style={styles.friendItem}>
                <div style={styles.friendInfo}>
                  <div
                    style={{
                      ...styles.statusDot,
                      background:
                        friend.status === "online" ? "#10b981" : "#6b7280",
                    }}
                  />
                  <span style={styles.friendName}>{friend.username}</span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {friend.party?.privacy === "public" &&
                    !friend.party.isFull &&
                    !party && (
                      <button
                        onClick={() => handleJoinParty(friend.party!.id)}
                        style={styles.joinButton}
                      >
                        Join Party
                      </button>
                    )}
                  <span style={styles.friendStatus}>
                    {friend.status === "online" ? "Online" : "Offline"}
                  </span>
                  <button
                    onClick={() => handleRemoveFriend(friend.uid)}
                    style={styles.dangerButton}
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => handleBlockUser(friend.uid)}
                    style={{ ...styles.dangerButton, background: "#4b5563" }}
                  >
                    Block
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Blocked Users */}
        {blockedUsers.length > 0 && (
          <>
            <div style={styles.sectionDivider} />
            <h2 style={styles.sectionTitle}>Blocked Users</h2>
            <div style={styles.list}>
              {blockedUsers.map((user) => (
                <div key={user.uid} style={styles.listItem}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <span style={{ color: "#9ca3af", fontSize: "14px" }}>
                      {user.uid}
                    </span>
                    <button
                      onClick={() => handleUnblockUser(user.uid)}
                      style={styles.smallButton}
                    >
                      Unblock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={styles.sectionDivider} />

        <button
          onClick={() => router.push("/profile")}
          style={styles.secondaryButton}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#0b0d10",
    color: "#e7e9ed",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    padding: "20px",
  } as React.CSSProperties,

  card: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "6px",
    padding: "36px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
    maxWidth: "540px",
    width: "100%",
  } as React.CSSProperties,

  title: {
    margin: "0 0 28px 0",
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: "#f5f7fb",
    textAlign: "center" as const,
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: "18px",
    color: "#f5f7fb",
    marginBottom: "16px",
  } as React.CSSProperties,

  sectionDivider: {
    height: "1px",
    background: "#1e232d",
    margin: "24px 0",
  } as React.CSSProperties,

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #1f2a3a",
    background: "#0b0d10",
    color: "#f5f7fb",
    fontSize: "14px",
    outline: "none",
  } as React.CSSProperties,

  button: {
    width: "100%",
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: 600,
    border: "1px solid #1f2a3a",
    borderRadius: "4px",
    background: "#0f62fe",
    color: "#f5f7fb",
    cursor: "pointer",
    marginBottom: "10px",
  } as React.CSSProperties,

  secondaryButton: {
    width: "100%",
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: 600,
    border: "1px solid #1f2a3a",
    borderRadius: "4px",
    background: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
  } as React.CSSProperties,

  smallButton: {
    padding: "0 16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: 600,
  } as React.CSSProperties,

  dangerButton: {
    padding: "4px 12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  } as React.CSSProperties,

  acceptButton: {
    padding: "4px 12px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  } as React.CSSProperties,

  promoteButton: {
    padding: "4px 12px",
    background: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "8px",
  } as React.CSSProperties,

  errorText: {
    color: "#f87171",
    fontSize: "12px",
    marginTop: "6px",
  } as React.CSSProperties,

  successText: {
    color: "#34d399",
    fontSize: "12px",
    marginTop: "6px",
  } as React.CSSProperties,

  partyBox: {
    background: "#1f2937",
    padding: "16px",
    borderRadius: "6px",
    marginBottom: "20px",
  } as React.CSSProperties,

  partyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  } as React.CSSProperties,

  subTitle: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: "0 0 10px 0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  } as React.CSSProperties,

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px",
  } as React.CSSProperties,

  listItem: {
    background: "#111827",
    padding: "8px 12px",
    borderRadius: "4px",
    fontSize: "14px",
  } as React.CSSProperties,

  divider: {
    height: "1px",
    background: "#374151",
    margin: "16px 0",
  } as React.CSSProperties,

  inviteItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111827",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "8px",
    fontSize: "14px",
  } as React.CSSProperties,

  addFriendBox: {
    marginBottom: "20px",
  } as React.CSSProperties,

  requestsBox: {
    background: "#1f2937",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
  } as React.CSSProperties,

  requestItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    fontSize: "14px",
  } as React.CSSProperties,

  friendList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  } as React.CSSProperties,

  friendItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#0f1218",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #1f2a3a",
  } as React.CSSProperties,

  friendInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  } as React.CSSProperties,

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  } as React.CSSProperties,

  friendName: {
    color: "#e5e7eb",
    fontSize: "14px",
    fontWeight: 500,
  } as React.CSSProperties,

  joinButton: {
    padding: "4px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "8px",
  } as React.CSSProperties,

  friendStatus: {
    color: "#9ca3af",
    fontSize: "12px",
  } as React.CSSProperties,

  emptyText: {
    color: "#6b7280",
    fontSize: "14px",
    fontStyle: "italic",
  } as React.CSSProperties,
};
