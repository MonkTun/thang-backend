import { useState, type ChangeEvent } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/router";

/**
 * LOGIN PAGE
 *
 * PURPOSE:
 * - Provide a simple web interface for users to log in with Google or Email/Password
 * - Retrieve Firebase ID token after successful login
 * - Call /api/auth/bootstrap to create/fetch user in MongoDB
 * - Redirect to /profile page on success
 *
 * WHAT HAPPENS:
 * 1. User clicks "Login with Google" or enters Email/Password
 * 2. Firebase authenticates user
 * 3. We get user credentials and ID token
 * 4. Call bootstrap endpoint to ensure user exists in MongoDB
 * 5. Redirect to /profile page
 */

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSaving, setUsernameSaving] = useState(false);

  // Email/Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Find Email State
  const [findEmailUsername, setFindEmailUsername] = useState("");
  const [foundEmail, setFoundEmail] = useState<string | null>(null);

  const handleAuthSuccess = async (user: any) => {
    console.log("Auth successful:", {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    });

    //  Get Firebase ID token
    const idToken = await user.getIdToken();
    console.log("🔑 Got ID Token:", idToken.substring(0, 50) + "...");

    //  Call bootstrap endpoint to create/fetch user in MongoDB
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
        }`,
      );
    }

    const data = await bootstrapResponse.json();
    // Handle both old format (direct user object) and new format ({ user: ... })
    const userData = data.user ? data.user : data;

    console.log("Bootstrap successful, user data:", userData);

    //  Store token in localStorage for profile page
    localStorage.setItem("idToken", idToken);
    localStorage.setItem("uid", user.uid);
    if (userData.avatarId) {
      localStorage.setItem("avatarId", userData.avatarId);
    } else {
      localStorage.removeItem("avatarId");
    }
    // Dispatch event to update NavBar immediately
    window.dispatchEvent(new Event("auth-change"));

    // Require username if missing
    if (userData.username) {
      const returnUrl = router.query.returnUrl;
      const target = typeof returnUrl === "string" ? returnUrl : "/profile";
      console.log(`🎯 Redirecting to ${target}...`);
      router.push(target);
      return;
    }

    console.log("📝 Username required. Prompting user to choose one.");
    setNeedsUsername(true);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setUsernameError(null);

    try {
      // SIGN IN WITH GOOGLE FIREBASE
      console.log("🔐 Starting Google Sign-In...");
      const result = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(result.user);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        console.error("Google Sign-In Error:", err);
        setError(err.message || "Failed to sign in with Google");
      }
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
      }
      await handleAuthSuccess(userCredential.user);
    } catch (err: any) {
      console.error("Email Auth Error:", err);
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetMessage(null);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleFindEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFoundEmail(null);

    try {
      const res = await fetch("/api/auth/find-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: findEmailUsername }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to find email");
      }

      const data = await res.json();
      setFoundEmail(data.email);
    } catch (err: any) {
      setError(err.message);
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

      console.log("Username set. Redirecting...");
      const returnUrl = router.query.returnUrl;
      const target = typeof returnUrl === "string" ? returnUrl : "/profile";
      router.push(target);
    } catch (err: any) {
      setUsernameError(err.message || "Failed to set username");
    } finally {
      setUsernameSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Thang</h1>
        <p style={styles.subtitle}>
          {needsUsername
            ? "Choose a username to finish setup"
            : "Sign in to validate the client"}
        </p>

        {!needsUsername ? (
          <>
            {showForgotPassword ? (
              <form onSubmit={handlePasswordReset} style={{ width: "100%" }}>
                <h2 style={{ ...styles.subtitle, marginBottom: "16px" }}>
                  Reset Password
                </h2>
                {resetMessage && (
                  <div
                    style={{
                      ...styles.error,
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      borderColor: "#22c55e",
                      color: "#22c55e",
                    }}
                  >
                    {resetMessage}
                  </div>
                )}
                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.button,
                    opacity: loading ? 0.6 : 1,
                    marginBottom: "12px",
                  }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  style={{
                    ...styles.button,
                    background: "transparent",
                    border: "1px solid #333",
                    color: "#888",
                  }}
                >
                  Back to Login
                </button>

                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "16px",
                    borderTop: "1px solid #333",
                  }}
                >
                  <h3 style={{ ...styles.inputLabel, marginBottom: "8px" }}>
                    Forgot Email?
                  </h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Enter Username"
                      value={findEmailUsername}
                      onChange={(e) => setFindEmailUsername(e.target.value)}
                      style={{ ...styles.input, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleFindEmail}
                      disabled={loading || !findEmailUsername}
                      style={{
                        ...styles.button,
                        width: "auto",
                        padding: "0 16px",
                        background: "#333",
                      }}
                    >
                      Find
                    </button>
                  </div>
                  {foundEmail && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        color: "#22c55e",
                      }}
                    >
                      Email hint: {foundEmail}
                    </div>
                  )}
                </div>
              </form>
            ) : (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  style={{
                    ...styles.button,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                    marginBottom: "24px",
                    background: "#ffffff",
                    color: "#1f1f1f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    border: "1px solid #dadce0",
                    borderRadius: "4px",
                    padding: "12px 16px",
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "background-color .2s, box-shadow .2s",
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "#f7f8f8";
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.12)";
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                  {loading ? "Signing in..." : "Sign in with Google"}
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "24px 0",
                    color: "#666",
                  }}
                >
                  <div style={{ flex: 1, height: "1px", background: "#333" }} />
                  <span style={{ padding: "0 12px", fontSize: "14px" }}>
                    OR
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "#333" }} />
                </div>

                <form onSubmit={handleEmailAuth} style={{ width: "100%" }}>
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                      required
                      minLength={6}
                    />
                    <div style={{ textAlign: "right", marginTop: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#9aa3b5",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: "12px",
                          textDecoration: "underline",
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  {error && <div style={styles.error}>{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...styles.button,
                      opacity: loading ? 0.6 : 1,
                      marginBottom: "16px",
                    }}
                  >
                    {loading
                      ? "Processing..."
                      : isSignUp
                        ? "Sign Up"
                        : "Sign In"}
                  </button>
                </form>

                <div
                  style={{ marginTop: "16px", fontSize: "12px", color: "#666" }}
                >
                  By logging in, you agree to our{" "}
                  <a
                    href="/terms"
                    style={{ color: "#3b82f6", textDecoration: "none" }}
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    style={{ color: "#3b82f6", textDecoration: "none" }}
                  >
                    Privacy Policy
                  </a>
                  .
                </div>
              </>
            )}
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
};
