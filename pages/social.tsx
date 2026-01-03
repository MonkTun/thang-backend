import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface Friend {
  uid: string;
  username: string;
  avatarId?: string;
  status: string;
  client?: "web" | "unreal";
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
  avatarId?: string;
  joinedAt: string;
}

interface JoinRequest {
  uid: string;
  username: string;
  requestedAt: string;
}

interface Party {
  _id: string;
  leaderUid: string;
  members: PartyMember[];
  joinRequests?: JoinRequest[];
  privacy: "public" | "private";
  region?: string;
}

interface PartyInvite {
  partyId: string;
  leaderUsername: string;
  invitedAt: string;
}

const ContextMenuItem = ({
  onClick,
  style,
  children,
}: {
  onClick: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...style,
        backgroundColor: hover ? "#374151" : "transparent",
      }}
    >
      {children}
    </button>
  );
};

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
  const [bannerId, setBannerId] = useState<string | null>(null);
  const [activeMenuFriendId, setActiveMenuFriendId] = useState<string | null>(
    null
  );
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      try {
        // Refresh token
        const idToken = await currentUser.getIdToken(true);
        localStorage.setItem("idToken", idToken);
        localStorage.setItem("uid", currentUser.uid);

        setCurrentUserUid(currentUser.uid);
        setLoading(false);

        // Fetch initial data with fresh token
        fetchUserProfile();
        fetchFriends();
        fetchPartyStatus();
        fetchRegion();
        fetchMatchmakingConfigs();
      } catch (e) {
        console.error("Auth refresh failed", e);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      const idToken = localStorage.getItem("idToken");
      const res = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          if (data.user.bannerId) setBannerId(data.user.bannerId);
          if (data.user.username) setCurrentUsername(data.user.username);
          if (data.user.inviteCode) setInviteCode(data.user.inviteCode);
        }
      }
    } catch (e) {
      console.error("Failed to fetch user profile", e);
    }
  };

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
          // Only set default if not already set (e.g. by party status)
          setSelectedRegion((prev) => prev || data.regions[0]);
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
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ client: "web" }),
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
        if (data.party && data.party.region) {
          setSelectedRegion(data.party.region);
          // Ensure the party's region is in the available list
          setAvailableRegions((prev) => {
            if (prev.length > 0 && !prev.includes(data.party.region)) {
              return [...prev, data.party.region];
            }
            return prev;
          });
        }
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

  const handleCancelRequest = async (targetUid: string) => {
    setFriendError(null);
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/friends/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUid }),
      });
      if (!res.ok) throw new Error("Failed to cancel request");
      fetchFriends();
    } catch (e: any) {
      console.error(e);
      setFriendError(e.message || "Failed to cancel friend request");
    }
  };

  // --- PARTY ACTIONS ---

  // handleCreateParty is no longer needed as users are always in a party
  // But we might want to keep a "Reset Party" or similar if needed,
  // though "Leave Party" now effectively does that (creates a new solo party).

  const handleLeaveParty = async () => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      await fetch("/api/party/leave", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      // After leaving, we are immediately in a new party, so just refresh
      fetchPartyStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleInviteToParty = async (username?: string) => {
    setPartyError(null);
    setPartySuccess(null);
    const idToken = localStorage.getItem("idToken");
    const target =
      typeof username === "string" ? username : partyTargetUsername;

    if (!idToken || !target) return;

    try {
      const res = await fetch("/api/party/invite", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUsername: target }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPartySuccess(`Invited ${target}`);
      if (target === partyTargetUsername) setPartyTargetUsername("");
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
      // Refresh status to clean up stale invites if the join failed (e.g. 404)
      fetchPartyStatus();
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

  const handlePartySettings = async (updates: {
    privacy?: "public" | "private";
    region?: string;
  }) => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;
    try {
      const res = await fetch("/api/party/settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
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

  const handleAcceptJoinRequest = async (requesterUid: string) => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      const res = await fetch("/api/party/accept-join", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterUid }),
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

  const handleRejectJoinRequest = async (requesterUid: string) => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      const res = await fetch("/api/party/reject-join", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterUid }),
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

  const handleAskToJoinParty = async (targetUsername: string) => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      const res = await fetch("/api/party/request-join", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUsername }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPartySuccess(`Sent join request to ${targetUsername}'s party`);
    } catch (e: any) {
      setPartyError(e.message);
    }
  };

  const handleDeclinePartyInvite = async (partyId: string) => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) return;

    try {
      const res = await fetch("/api/party/decline", {
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
      // Refresh status to remove the invite from the list
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
      {/* Blurred Background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: bannerId ? "transparent" : "#0b0d10",
          backgroundImage: bannerId ? `url(/Banners/${bannerId}.png)` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: bannerId ? "blur(20px) brightness(0.5)" : "none",
          zIndex: 0,
          transition: "background-image 0.5s ease-in-out",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
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
                    {party.members.length > 1 ? "In Party" : "Solo Party"}
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
                {/* Only show Leave button if there are other members, effectively "Reset to Solo" */}
                {party.members.length > 1 && (
                  <button
                    onClick={handleLeaveParty}
                    style={styles.dangerButton}
                  >
                    Leave
                  </button>
                )}
              </div>

              {party.leaderUid === currentUserUid && (
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
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
                        handlePartySettings({
                          privacy:
                            party.privacy === "public" ? "private" : "public",
                        })
                      }
                      style={{ ...styles.smallButton, width: "auto" }}
                    >
                      Switch to{" "}
                      {party.privacy === "public" ? "Private" : "Public"}
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#9ca3af",
                        marginRight: "8px",
                      }}
                    >
                      Region:
                    </span>
                    <select
                      value={selectedRegion || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedRegion(val);
                        handlePartySettings({ region: val });
                      }}
                      style={{
                        backgroundColor: "#1f2937",
                        color: "#e5e7eb",
                        border: "1px solid #374151",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        outline: "none",
                      }}
                    >
                      {availableRegions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <img
                          src={`/ProfilePicture/${m.avatarId || "Alpha"}.png`}
                          alt="Avatar"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "4px",
                            objectFit: "cover",
                            backgroundColor: "#1f2937",
                          }}
                        />
                        <span>
                          {m.username || "Loading..."}{" "}
                          {m.uid === party.leaderUid && "👑"}
                        </span>
                      </div>
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

              {party.leaderUid === currentUserUid &&
                party.joinRequests &&
                party.joinRequests.length > 0 && (
                  <>
                    <div style={styles.divider} />
                    <h3 style={styles.subTitle}>Join Requests</h3>
                    <div style={styles.list}>
                      {party.joinRequests.map((req) => (
                        <div key={req.uid} style={styles.listItem}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <span>{req.username}</span>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => handleAcceptJoinRequest(req.uid)}
                                style={styles.acceptButton}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectJoinRequest(req.uid)}
                                style={styles.dangerButton}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

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
                <button
                  onClick={() => handleInviteToParty()}
                  style={styles.smallButton}
                >
                  Invite
                </button>
              </div>
              {partyError && <p style={styles.errorText}>{partyError}</p>}
              {partySuccess && <p style={styles.successText}>{partySuccess}</p>}

              {/* Show Invites even if in party (since we can switch parties) */}
              {partyInvites.length > 0 && (
                <div
                  style={{
                    marginTop: "20px",
                    borderTop: "1px solid #374151",
                    paddingTop: "16px",
                  }}
                >
                  <h3 style={styles.subTitle}>Party Invites</h3>
                  {partyInvites.map((inv) => (
                    <div key={inv.partyId} style={styles.inviteItem}>
                      <span>
                        Invited by <b>{inv.leaderUsername}</b>
                      </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleJoinParty(inv.partyId)}
                          style={styles.acceptButton}
                        >
                          Join
                        </button>
                        <button
                          onClick={() => handleDeclinePartyInvite(inv.partyId)}
                          style={{
                            ...styles.dangerButton,
                            background: "#ef4444",
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={styles.partyBox}>
              <p style={{ color: "#c8cbd2" }}>Loading party data...</p>
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

            {/* Matchmaking Status */}
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

          {/* Invite Link Section */}
          {inviteCode && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={styles.subTitle}>Invite Friends via Link</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/invite?code=${inviteCode}`}
                  style={{
                    ...styles.input,
                    color: "#9ca3af",
                    cursor: "default",
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/invite?code=${inviteCode}`
                    );
                    setFriendSuccess("Link copied to clipboard!");
                  }}
                  style={styles.smallButton}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {friendError && (
            <p style={{ ...styles.errorText, marginBottom: "12px" }}>
              {friendError}
            </p>
          )}

          {/* Add Friend Section */}
          <h3 style={styles.subTitle}>Add Friend Directly</h3>
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
                        style={{
                          ...styles.dangerButton,
                          background: "#4b5563",
                        }}
                      >
                        Block
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Sent Requests */}
          {requests.filter((r) => r.type === "outgoing").length > 0 && (
            <div style={styles.requestsBox}>
              <h3 style={styles.subTitle}>Sent Requests</h3>
              {requests
                .filter((r) => r.type === "outgoing")
                .map((req) => (
                  <div key={req.uid} style={styles.requestItem}>
                    <span style={{ color: "#9ca3af" }}>{req.username}</span>
                    <button
                      onClick={() => handleCancelRequest(req.uid)}
                      style={{ ...styles.dangerButton, background: "#4b5563" }}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Friend List */}
          <div style={styles.friendList}>
            {/* Backdrop for closing menu */}
            {activeMenuFriendId && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 10,
                }}
                onClick={() => setActiveMenuFriendId(null)}
              />
            )}

            {friends.length === 0 ? (
              <p style={styles.emptyText}>No friends yet. Add someone!</p>
            ) : (
              [...friends]
                .sort((a, b) => {
                  const aOffline =
                    !a.status || a.status.toLowerCase() === "offline";
                  const bOffline =
                    !b.status || b.status.toLowerCase() === "offline";
                  if (aOffline !== bOffline) return aOffline ? 1 : -1;
                  return a.username.localeCompare(b.username);
                })
                .map((friend) => {
                  const isOffline =
                    !friend.status || friend.status.toLowerCase() === "offline";
                  return (
                    <div key={friend.uid} style={styles.friendItem}>
                      <div style={styles.friendInfo}>
                        <div
                          style={{
                            position: "relative",
                            width: "32px",
                            height: "32px",
                          }}
                        >
                          <img
                            src={`/ProfilePicture/${
                              friend.avatarId || "Alpha"
                            }.png`}
                            alt="Avatar"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "4px",
                              objectFit: "cover",
                              backgroundColor: "#1f2937",
                              opacity: isOffline ? 0.5 : 1,
                              filter: isOffline ? "grayscale(100%)" : "none",
                            }}
                          />
                          {!isOffline && (
                            <div
                              style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                fontSize: "12px",
                                backgroundColor: "#11141a",
                                borderRadius: "50%",
                                padding: "2px",
                                lineHeight: 1,
                              }}
                            >
                              {friend.client === "unreal" ? "🎮" : "🌐"}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                          }}
                        >
                          <span style={styles.friendName}>
                            {friend.username}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              color: isOffline ? "#6b7280" : "#10b981",
                            }}
                          >
                            {isOffline ? "Offline" : friend.status}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          position: "relative",
                        }}
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

                        {/* Context Menu Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuFriendId(
                              activeMenuFriendId === friend.uid
                                ? null
                                : friend.uid
                            );
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#9ca3af",
                            cursor: "pointer",
                            fontSize: "20px",
                            padding: "0 8px",
                            lineHeight: 1,
                          }}
                        >
                          ⋮
                        </button>

                        {/* Context Menu */}
                        {activeMenuFriendId === friend.uid && (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: 0,
                              backgroundColor: "#1f2937",
                              border: "1px solid #374151",
                              borderRadius: "4px",
                              padding: "4px",
                              zIndex: 20,
                              minWidth: "120px",
                              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                            }}
                          >
                            <ContextMenuItem
                              onClick={() => {
                                handleInviteToParty(friend.username);
                                setActiveMenuFriendId(null);
                              }}
                              style={{
                                ...styles.menuButton,
                                color: "#e5e7eb",
                              }}
                            >
                              Invite to Party
                            </ContextMenuItem>
                            {friend.party && friend.party.id !== party?._id && (
                              <ContextMenuItem
                                onClick={() => {
                                  handleAskToJoinParty(friend.username);
                                  setActiveMenuFriendId(null);
                                }}
                                style={{
                                  ...styles.menuButton,
                                  color: "#e5e7eb",
                                }}
                              >
                                Ask to Join Party
                              </ContextMenuItem>
                            )}
                            <ContextMenuItem
                              onClick={() => {
                                handleRemoveFriend(friend.uid);
                                setActiveMenuFriendId(null);
                              }}
                              style={{
                                ...styles.menuButton,
                                color: "#ef4444",
                              }}
                            >
                              Remove Friend
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={() => {
                                handleBlockUser(friend.uid);
                                setActiveMenuFriendId(null);
                              }}
                              style={{
                                ...styles.menuButton,
                                color: "#9ca3af",
                              }}
                            >
                              Block
                            </ContextMenuItem>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
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

  menuButton: {
    background: "transparent",
    border: "none",
    padding: "8px 12px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "13px",
    borderRadius: "2px",
    width: "100%",
  } as React.CSSProperties,

  emptyText: {
    color: "#6b7280",
    fontSize: "14px",
    fontStyle: "italic",
  } as React.CSSProperties,
};
