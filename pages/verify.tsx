import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase"; // Client-side firebase
import { onAuthStateChanged, User } from "firebase/auth";

export default function VerifyPage() {
  const router = useRouter();
  const { code } = router.query;

  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<
    "loading" | "confirming" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Listen for Auth State (Is user logged in on the web?)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setStatus("confirming");
      } else {
        setStatus("loading"); // Waiting for user to log in via the UI
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Trigger Confirmation Logic when User + Code exists
  useEffect(() => {
    if (user && code && status === "confirming") {
      confirmLogin();
    }
  }, [user, code, status]);

  const confirmLogin = async () => {
    if (!user || typeof code !== "string") return;

    try {
      const idToken = await user.getIdToken();

      const res = await fetch("/api/auth/session/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceCode: code,
          idToken: idToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to confirm login");
      }

      setStatus("success");

      // Optional: Close window after 3 seconds
      setTimeout(() => {
        // window.close() only works if opened by script, but we can try
        // or just redirect to profile
        router.push("/profile");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (!code) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.errorTitle}>Invalid Link</h1>
          <p>Missing device code.</p>
        </div>
      </div>
    );
  }

  // State: SUCCESS
  if (status === "success") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.successTitle}>Login Successful!</h1>
          <p style={{ color: "#aaa" }}>
            You have successfully logged in on your game client.
          </p>
          <p style={{ marginTop: "20px", fontSize: "14px" }}>
            You can now close this tab.
          </p>
        </div>
      </div>
    );
  }

  // State: ERROR
  if (status === "error") {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.errorTitle}>Login Failed</h1>
          <p style={styles.errorText}>{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            style={styles.button}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // State: NOT LOGGED IN (Show Login UI)
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Login to Game</h1>
          <p style={styles.subtitle}>
            Please log in to authorize the game client.
          </p>
          {/* Pass the returnUrl so the user can come back here after login if you implement that logic in login.tsx */}
          <a
            href={`/login?returnUrl=${encodeURIComponent(
              `/verify?code=${code}`
            )}`}
            style={styles.button}
          >
            Go to Login Page
          </a>
        </div>
      </div>
    );
  }

  // State: CONFIRMING (Loading Spinner)
  return (
    <div style={styles.container}>
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div style={styles.card}>
        <div style={styles.spinner}></div>
        <p>Connecting to Game Client...</p>
      </div>
    </div>
  );
}

// Simple Dark Mode Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b0d10",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
  } as React.CSSProperties,
  card: {
    backgroundColor: "#11141a",
    padding: "40px",
    borderRadius: "8px",
    border: "1px solid #1e232d",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  } as React.CSSProperties,
  title: { fontSize: "24px", marginBottom: "10px" } as React.CSSProperties,
  successTitle: {
    fontSize: "24px",
    marginBottom: "10px",
    color: "#22c55e",
  } as React.CSSProperties,
  errorTitle: {
    fontSize: "24px",
    marginBottom: "10px",
    color: "#ef4444",
  } as React.CSSProperties,
  subtitle: { color: "#9ca3af", marginBottom: "30px" } as React.CSSProperties,
  errorText: { color: "#f87171", marginBottom: "20px" } as React.CSSProperties,
  button: {
    display: "inline-block",
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "4px",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  } as React.CSSProperties,
  spinner: {
    margin: "0 auto 20px",
    width: "40px",
    height: "40px",
    border: "3px solid rgba(255,255,255,0.1)",
    borderRadius: "50%",
    borderTopColor: "#2563eb",
    animation: "spin 1s ease-in-out infinite",
  } as React.CSSProperties,
};
