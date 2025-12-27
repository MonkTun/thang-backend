import { useState, type ChangeEvent } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/router";

/**
 * LOGIN PAGE
 *
 * PURPOSE:
 * - Provide a simple web interface for users to log in with Google
 * - Retrieve Firebase ID token after successful login
 * - Call /api/auth/bootstrap to create/fetch user in MongoDB
 * - Redirect to /profile page on success
 *
 * WHAT HAPPENS:
 * 1. User clicks "Login with Google"
 * 2. Firebase opens Google auth popup
 * 3. User signs in
 * 4. We get user credentials and ID token
 * 5. Call bootstrap endpoint to ensure user exists in MongoDB
 * 6. Redirect to /profile page
 */

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSaving, setUsernameSaving] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setUsernameError(null);

    try {
      // Step 1: Sign in with Google via Firebase
      console.log("🔐 Starting Google Sign-In...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Google Sign-In successful:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

      // Step 2: Get Firebase ID token
      const idToken = await user.getIdToken();
      console.log("🔑 Got ID Token:", idToken.substring(0, 50) + "...");

      // Step 3: Call bootstrap endpoint to create/fetch user in MongoDB
      console.log("📡 Calling /api/auth/bootstrap...");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const bootstrapResponse = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!bootstrapResponse.ok) {
        const errorData = (await bootstrapResponse.json()) as {
          error?: string;
        };
        throw new Error(
          `Bootstrap failed: ${bootstrapResponse.status} - ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const userData = (await bootstrapResponse.json()) as {
        username?: string | null;
      };
      console.log("Bootstrap successful, user data:", userData);

      // Step 4: Store token in localStorage for profile page
      localStorage.setItem("idToken", idToken);
      localStorage.setItem("uid", user.uid);

      // Step 5: Require username if missing
      if (userData.username) {
        console.log("🎯 Redirecting to /profile...");
        router.push("/profile");
        return;
      }

      console.log("📝 Username required. Prompting user to choose one.");
      setNeedsUsername(true);
      setLoading(false);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setError("Request timed out. Please try again.");
        console.error("Sign-in error: bootstrap request timed out");
        return;
      }

      const errorMessage = err.message || "Unknown error occurred";
      console.error("Sign-in error:", errorMessage);

      // Provide helpful error messages
      let friendlyMessage = errorMessage;
      if (errorMessage.includes("500")) {
        friendlyMessage =
          "Server error (500). Check that Firebase Admin credentials are configured in .env.local. See FIREBASE_SETUP_ADMIN.md for instructions.";
      } else if (errorMessage.includes("401")) {
        friendlyMessage =
          "Authentication failed. Make sure your Google account is allowed to sign in.";
      } else if (errorMessage.includes("Bootstrap")) {
        friendlyMessage =
          "Failed to create user. Check server logs for details.";
      }

      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSave = async () => {
    const trimmed = username.trim();
    setUsernameError(null);

    if (!trimmed) {
      setUsernameError("Username is required");
      return;
    }

    if (!/^(?=.{3,20}$)[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setUsernameError("Use 3-20 letters, numbers, underscores or hyphens");
      return;
    }

    const token = localStorage.getItem("idToken");
    if (!token) {
      setUsernameError("Missing token. Please sign in again.");
      return;
    }

    try {
      setUsernameSaving(true);
      const resp = await fetch("/api/auth/username", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: trimmed }),
      });

      if (!resp.ok) {
        const data = (await resp.json()) as { error?: string };
        if (resp.status === 409) {
          setUsernameError("That username is taken. Try another.");
          return;
        }
        throw new Error(data.error || "Failed to set username");
      }

      console.log("Username set. Redirecting to profile...");
      router.push("/profile");
    } catch (err: any) {
      setUsernameError(err.message || "Failed to set username");
    } finally {
      setUsernameSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Thang Backend</h1>
        <p style={styles.subtitle}>
          {needsUsername
            ? "Choose a username to finish setup"
            : "Sign in to validate the backend"}
        </p>

        {!needsUsername ? (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Login with Google"}
            </button>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.debugBox}>
              <h3 style={styles.debugTitle}>Debug Info</h3>
              <p style={styles.debugText}>
                Signs in with Firebase, then calls{" "}
                <code>/api/auth/bootstrap</code>
                to create or fetch your user in MongoDB.
              </p>
              <p style={styles.debugText}>
                Open the console (F12) for step-by-step logs.
              </p>
            </div>
          </>
        ) : (
          <>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel} htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = (e.target as unknown as { value: string })
                    .value;
                  setUsername(value);
                }}
                placeholder="Pick something unique"
                style={styles.input}
                maxLength={20}
                autoFocus
              />
              <p style={styles.inputHelper}>
                3-20 characters. Letters, numbers, underscores, or hyphens.
              </p>
            </div>

            {usernameError && <div style={styles.error}>{usernameError}</div>}

            <button
              onClick={handleUsernameSave}
              disabled={usernameSaving}
              style={{
                ...styles.button,
                opacity: usernameSaving ? 0.6 : 1,
                cursor: usernameSaving ? "wait" : "pointer",
              }}
            >
              {usernameSaving ? "Saving..." : "Save username"}
            </button>
          </>
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
  } as React.CSSProperties,

  card: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "6px",
    padding: "36px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
    maxWidth: "420px",
    width: "100%",
    textAlign: "center" as const,
  } as React.CSSProperties,

  title: {
    margin: "0 0 10px 0",
    fontSize: "28px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: "#f5f7fb",
  } as React.CSSProperties,

  subtitle: {
    margin: "0 0 28px 0",
    fontSize: "14px",
    color: "#98a2b3",
  } as React.CSSProperties,

  inputGroup: {
    textAlign: "left" as const,
    marginBottom: "12px",
  } as React.CSSProperties,

  inputLabel: {
    display: "block",
    marginBottom: "6px",
    fontSize: "12px",
    letterSpacing: "0.02em",
    color: "#9aa3b5",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #1f2a3a",
    background: "#0f1218",
    color: "#f5f7fb",
    fontSize: "14px",
    outline: "none",
  } as React.CSSProperties,

  inputHelper: {
    margin: "6px 0 0 0",
    fontSize: "12px",
    color: "#98a2b3",
  } as React.CSSProperties,

  button: {
    width: "100%",
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    border: "1px solid #1f2a3a",
    borderRadius: "4px",
    background: "#0f62fe",
    color: "#f5f7fb",
    transition:
      "background 0.2s ease, border-color 0.2s ease, transform 0.05s ease",
    marginBottom: "18px",
  } as React.CSSProperties,

  error: {
    background: "#2c1f24",
    color: "#f2c2cb",
    border: "1px solid #3a252d",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "18px",
    fontSize: "13px",
    textAlign: "left" as const,
  } as React.CSSProperties,

  debugBox: {
    background: "#0f1218",
    border: "1px solid #1e232d",
    padding: "14px",
    borderRadius: "4px",
    fontSize: "12px",
    textAlign: "left" as const,
    color: "#98a2b3",
  } as React.CSSProperties,

  debugTitle: {
    margin: "0 0 6px 0",
    fontSize: "13px",
    fontWeight: 600,
    color: "#e7e9ed",
  } as React.CSSProperties,

  debugText: {
    margin: "0 0 6px 0",
    lineHeight: 1.5,
  } as React.CSSProperties,
};
