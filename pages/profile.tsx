import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * PROFILE PAGE
 *
 * PURPOSE:
 * - Display the logged-in user's profile data
 * - Fetch user data from MongoDB via /api/auth/bootstrap
 * - Allow user to log out
 * - Prove that MongoDB persistence works
 *
 * WHAT HAPPENS:
 * 1. Page loads
 * 2. Retrieve idToken and uid from localStorage
 * 3. Call /api/auth/bootstrap to get user data from MongoDB
 * 4. Display user info (uid, email, rank, coins)
 * 5. User can refresh page and data persists (from MongoDB)
 * 6. User can log out
 */

interface UserData {
  _id: string;
  email: string;
  username?: string | null;
  rank: number;
  coins: number;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const idToken = localStorage.getItem("idToken");
        const uid = localStorage.getItem("uid");

        if (!idToken || !uid) {
          console.warn("No token or uid in localStorage, redirecting to login");
          router.push("/login");
          return;
        }

        console.log("Fetching user data from /api/auth/bootstrap...");
        const response = await fetch("/api/auth/bootstrap", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(
            `Failed to fetch user: ${response.status} - ${
              errorData.error || "Unknown error"
            }`
          );
        }

        const userData = (await response.json()) as UserData;
        console.log("User data fetched:", userData);
        setUser(userData);
        setUsername(userData.username || "");
      } catch (err: any) {
        console.error("Error fetching user:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log("Signing out...");
      await signOut(auth);
      localStorage.removeItem("idToken");
      localStorage.removeItem("uid");
      console.log("Logged out");
      router.push("/login");
    } catch (err: any) {
      console.error("Logout error:", err.message);
      setError("Failed to log out");
    } finally {
      setIsLoggingOut(false);
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
      setUsernameError("Missing token. Please log in again.");
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

      setUser((prev) =>
        prev
          ? { ...prev, username: trimmed, updated_at: new Date().toISOString() }
          : prev
      );
      setUsername(trimmed);
    } catch (err: any) {
      setUsernameError(err.message || "Failed to set username");
    } finally {
      setUsernameSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ color: "#c8cbd2" }}>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2
            style={{
              ...styles.title,
              fontSize: "22px",
              color: "#f97068",
              marginBottom: "12px",
            }}
          >
            Error
          </h2>
          <p style={{ color: "#c8cbd2", marginBottom: "18px" }}>{error}</p>
          <button onClick={() => router.push("/login")} style={styles.button}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2
            style={{ ...styles.title, fontSize: "22px", marginBottom: "12px" }}
          >
            No user data
          </h2>
          <p style={{ color: "#c8cbd2", marginBottom: "18px" }}>
            Could not load user profile
          </p>
          <button onClick={() => router.push("/login")} style={styles.button}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Your Profile</h1>

        <div style={styles.profileSection}>
          {user.username ? (
            <div style={styles.profileField}>
              <label style={styles.label}>Username</label>
              <p style={styles.value}>{user.username}</p>
            </div>
          ) : (
            <div style={styles.missingBox}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel} htmlFor="username">
                  Choose a username
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
                />
                <p style={styles.inputHelper}>
                  3-20 characters. Letters, numbers, underscores, or hyphens.
                </p>
              </div>
              {usernameError && (
                <div style={styles.inlineError}>{usernameError}</div>
              )}
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
            </div>
          )}

          <div style={styles.profileField}>
            <label style={styles.label}>Firebase UID</label>
            <code style={styles.code}>{user._id}</code>
          </div>

          <div style={styles.profileField}>
            <label style={styles.label}>Email</label>
            <p style={styles.value}>{user.email}</p>
          </div>

          <div style={styles.profileField}>
            <label style={styles.label}>Rank</label>
            <p style={styles.value}>{user.rank}</p>
          </div>

          <div style={styles.profileField}>
            <label style={styles.label}>Coins</label>
            <p style={styles.value}>{user.coins}</p>
          </div>

          <div style={styles.profileField}>
            <label style={styles.label}>Created At</label>
            <p style={styles.value}>
              {new Date(user.created_at).toLocaleString()}
            </p>
          </div>

          <div style={styles.profileField}>
            <label style={styles.label}>Updated At</label>
            <p style={styles.value}>
              {new Date(user.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{
            ...styles.button,
            background: isLoggingOut ? "#0d57e0" : "#0f62fe",
            borderColor: isLoggingOut ? "#1c355c" : "#1f2a3a",
            opacity: isLoggingOut ? 0.9 : 1,
            cursor: isLoggingOut ? "wait" : "pointer",
            transform: isLoggingOut ? "scale(0.995)" : "scale(1)",
          }}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>

        <div style={styles.debugBox}>
          <h3
            style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#e7e9ed" }}
          >
            What this proves
          </h3>
          <ul style={styles.list}>
            <li>Firebase Auth works (you logged in)</li>
            <li>Bootstrap endpoint works (created user in MongoDB)</li>
            <li>MongoDB persistence works (data survives refresh)</li>
            <li>Backend is ready for Unreal Engine</li>
          </ul>
          <p style={{ marginTop: "12px", fontSize: "12px", color: "#9aa3b5" }}>
            Check MongoDB Atlas to see your user document in the{" "}
            <code>game.users</code> collection.
          </p>
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

  profileSection: {
    marginBottom: "30px",
  } as React.CSSProperties,

  profileField: {
    marginBottom: "18px",
  } as React.CSSProperties,

  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#9aa3b5",
    textTransform: "uppercase" as const,
    marginBottom: "4px",
  } as React.CSSProperties,

  value: {
    margin: 0,
    fontSize: "15px",
    color: "#e7e9ed",
  } as React.CSSProperties,

  missingBox: {
    marginBottom: "24px",
    padding: "16px",
    border: "1px dashed #2b3544",
    borderRadius: "6px",
    background: "#0f1218",
  } as React.CSSProperties,

  inputGroup: {
    textAlign: "left" as const,
    marginBottom: "10px",
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
    background: "#0b0d10",
    color: "#f5f7fb",
    fontSize: "14px",
    outline: "none",
  } as React.CSSProperties,

  inputHelper: {
    margin: "6px 0 0 0",
    fontSize: "12px",
    color: "#98a2b3",
  } as React.CSSProperties,

  inlineError: {
    background: "#2c1f24",
    color: "#f2c2cb",
    border: "1px solid #3a252d",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "12px",
    fontSize: "13px",
  } as React.CSSProperties,

  code: {
    display: "block",
    background: "#0f1218",
    border: "1px solid #1e232d",
    padding: "10px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "monospace",
    color: "#d9dce2",
    wordBreak: "break-all" as const,
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
    marginBottom: "18px",
    transition:
      "background 0.2s ease, border-color 0.2s ease, transform 0.05s ease",
  } as React.CSSProperties,

  debugBox: {
    background: "#0f1218",
    border: "1px solid #1e232d",
    padding: "14px",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#98a2b3",
  } as React.CSSProperties,

  list: {
    margin: "0 0 0 20px",
    fontSize: "13px",
    color: "#c8cbd2",
  } as React.CSSProperties,
};
