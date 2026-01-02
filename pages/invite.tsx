import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function InvitePage() {
  const router = useRouter();
  const { code } = router.query;
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [targetUsername, setTargetUsername] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "resolving" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Resolve invite code
  useEffect(() => {
    if (!router.isReady || !code) {
      if (router.isReady && !code) setLoading(false);
      return;
    }

    const resolveCode = async () => {
      setStatus("resolving");
      try {
        const res = await fetch(`/api/user/lookup?code=${code}`);
        if (!res.ok) throw new Error("Invalid or expired invite link");
        const data = await res.json();
        setTargetUsername(data.username);
        setStatus("idle");
      } catch (e: any) {
        setStatus("error");
        setErrorMessage(e.message);
        setLoading(false);
      }
    };

    if (typeof code === "string") {
      resolveCode();
    }
  }, [router.isReady, code]);

  // Auto-execute logic
  useEffect(() => {
    if (!targetUsername || status !== "idle") return;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(false);
      if (authUser) {
        setCurrentUser(authUser);
        executeAddFriend(authUser, targetUsername);
      }
    });
    return () => unsubscribe();
  }, [targetUsername, status]);

  const executeAddFriend = async (authUser: any, targetUsername: string) => {
    setStatus("sending");
    setErrorMessage("");

    try {
      const idToken = await authUser.getIdToken();
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUsername }),
      });

      const data = await res.json();
      if (!res.ok) {
        // If already friends or request sent, treat as success
        if (
          data.error === "Friend request already sent" ||
          data.error === "Users are already friends"
        ) {
          setStatus("success");
          return;
        }
        throw new Error(data.error || "Failed to add friend");
      }

      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setErrorMessage(e.message);
    }
  };

  const handleLoginRedirect = () => {
    router.push(`/login?returnUrl=${encodeURIComponent(router.asPath)}`);
  };

  if (loading || status === "resolving") {
    return (
      <div style={styles.container}>
        <p style={{ color: "#9ca3af" }}>Loading invite...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Friend Invite</h1>

        {targetUsername ? (
          <div style={{ textAlign: "center" }}>
            <div style={styles.avatarPlaceholder}>
              <span style={{ fontSize: "32px" }}>👋</span>
            </div>

            <p style={styles.text}>
              <span style={{ fontWeight: "bold", color: "#fff" }}>
                {targetUsername}
              </span>
              <br />
              wants to be your friend!
            </p>

            {status === "success" ? (
              <div style={styles.successBox}>
                <p
                  style={{
                    color: "#34d399",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  Request Sent!
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#d1d5db",
                    marginBottom: "16px",
                    lineHeight: "1.4",
                  }}
                >
                  For security, <b>{targetUsername}</b> must confirm your
                  request.
                </p>
                <button
                  onClick={() => router.push("/social")}
                  style={styles.secondaryButton}
                >
                  Go to Social Hub
                </button>
              </div>
            ) : (
              <>
                {status === "error" && (
                  <p style={styles.errorText}>{errorMessage}</p>
                )}

                {status === "sending" ? (
                  <p style={{ color: "#9ca3af" }}>Accepting invite...</p>
                ) : (
                  !currentUser && (
                    <button onClick={handleLoginRedirect} style={styles.button}>
                      Login to Accept Invite
                    </button>
                  )
                )}
              </>
            )}
          </div>
        ) : (
          <p style={styles.errorText}>
            {errorMessage || "Invalid invite link."}
          </p>
        )}
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
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center" as const,
  } as React.CSSProperties,

  title: {
    margin: "0 0 24px 0",
    fontSize: "24px",
    fontWeight: 700,
    color: "#f5f7fb",
  } as React.CSSProperties,

  text: {
    fontSize: "16px",
    color: "#9ca3af",
    lineHeight: "1.5",
    marginBottom: "32px",
  } as React.CSSProperties,

  avatarPlaceholder: {
    width: "80px",
    height: "80px",
    background: "#1f2937",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px auto",
  } as React.CSSProperties,

  button: {
    width: "100%",
    padding: "14px",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    transition: "background 0.2s",
  } as React.CSSProperties,

  secondaryButton: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    fontWeight: 600,
    border: "1px solid #374151",
    borderRadius: "8px",
    background: "transparent",
    color: "#9ca3af",
    cursor: "pointer",
  } as React.CSSProperties,

  errorText: {
    color: "#ef4444",
    marginBottom: "16px",
  } as React.CSSProperties,

  successBox: {
    background: "rgba(16, 185, 129, 0.1)",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
  } as React.CSSProperties,
};
