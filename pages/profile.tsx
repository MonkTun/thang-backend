import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/router";
import { signOut, updatePassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * PROFILE PAGE
 *
 * PURPOSE:
 * - Display the logged-in user's profile data
 * - Fetch user data from MongoDB via /api/auth/bootstrap
 * - Allow user to log out
 * - Link to Social Hub
 */

interface UserData {
  _id: string;
  email: string;
  username?: string | null;
  rank: number;
  coins: number;
  avatarId?: string;
  bannerId?: string;
  equippedTitle?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Username State
  const [username, setUsername] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Customization State
  const [avatarId, setAvatarId] = useState("Alpha");
  const [bannerId, setBannerId] = useState("Alpha");
  const [equippedTitle, setEquippedTitle] = useState("unequipped");
  const [customizationSaving, setCustomizationSaving] = useState(false);
  const [customizationMessage, setCustomizationMessage] = useState<
    string | null
  >(null);

  //TODO update this data table everytime you add new avatars/banners
  const AVATARS = [
    "Alpha",
    "ChristmasTree",
    "HappySnowman",
    "Koipoleon",
    "SantaHat",
    "Snowflake",
  ];
  const BANNERS = ["Alpha", "Christmas", "Snowflakes", "TheFireHorse"];
  const TITLES = [
    "unequipped",
    "newcomer",
    "epstein",
    "calculator",
    "experienced",
  ];

  // 1. Initial Data Fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        console.warn("No user logged in, redirecting to login");
        router.push("/login");
        return;
      }

      try {
        // Force refresh token to ensure it's valid
        const idToken = await currentUser.getIdToken(true);
        localStorage.setItem("idToken", idToken);
        localStorage.setItem("uid", currentUser.uid);

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

        const data = await response.json();
        // Handle both old format (direct user object) and new format ({ user: ... })
        const userData = data.user ? data.user : data;

        console.log("User data fetched:", userData);
        setUser(userData);
        setUsername(userData.username || "");
        setAvatarId(userData.avatarId || "Alpha");
        setBannerId(userData.bannerId || "Alpha");
        setEquippedTitle(userData.equippedTitle || "unequipped");

        // Update localStorage and notify NavBar
        if (userData.avatarId) {
          localStorage.setItem("avatarId", userData.avatarId);
          window.dispatchEvent(new Event("auth-change"));
        }
      } catch (err: any) {
        console.error("Error fetching user:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 2. Heartbeat Loop (Every 30s)
  useEffect(() => {
    if (!user) return;
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

    // Send immediately, then interval
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // 3. Handle Tab Close / Navigation (Instant Offline)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const idToken = localStorage.getItem("idToken");
      if (idToken) {
        // Use keepalive to ensure request completes after tab close
        fetch("/api/presence/leave", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          keepalive: true,
        }).catch((err) => console.error("Leave beacon failed", err));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Notify server we are leaving
      const idToken = localStorage.getItem("idToken");
      if (idToken) {
        await fetch("/api/presence/leave", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ client: "web" }),
        });
      }

      console.log("Signing out...");
      await signOut(auth);
      localStorage.removeItem("idToken");
      localStorage.removeItem("uid");
      localStorage.removeItem("avatarId");
      window.dispatchEvent(new Event("auth-change"));
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
  const handleSaveCustomization = async (overrides?: {
    avatarId?: string;
    bannerId?: string;
    equippedTitle?: string;
  }) => {
    const newAvatarId = overrides?.avatarId ?? avatarId;
    const newBannerId = overrides?.bannerId ?? bannerId;
    const newEquippedTitle = overrides?.equippedTitle ?? equippedTitle;

    setCustomizationSaving(true);
    setCustomizationMessage(null);
    try {
      const idToken = localStorage.getItem("idToken");
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarId: newAvatarId,
          bannerId: newBannerId,
          equippedTitle: newEquippedTitle,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      setUser(data.user);
      setCustomizationMessage("Profile updated successfully!");

      // Update localStorage and notify NavBar
      localStorage.setItem("avatarId", newAvatarId);
      window.dispatchEvent(new Event("auth-change"));
    } catch (err) {
      console.error(err);
      setCustomizationMessage("Failed to save changes.");
    } finally {
      setCustomizationSaving(false);
    }
  };

  const handleSetPassword = async () => {
    setPasswordMessage(null);
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    try {
      setPasswordLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      await updatePassword(currentUser, newPassword);
      setPasswordMessage("Password updated successfully!");
      setNewPassword("");
    } catch (err: any) {
      console.error("Set Password Error:", err);
      if (err.code === "auth/requires-recent-login") {
        setPasswordError("Please log out and log back in to set a password.");
      } else {
        setPasswordError(err.message || "Failed to update password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ padding: "36px", textAlign: "center" }}>
            <p style={{ color: "#c8cbd2", margin: 0 }}>Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ padding: "36px", textAlign: "center" }}>
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
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ padding: "36px", textAlign: "center" }}>
            <h2
              style={{
                ...styles.title,
                fontSize: "22px",
                marginBottom: "12px",
              }}
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
          backgroundImage: `url(/Banners/${bannerId}.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(20px) brightness(0.4)",
          zIndex: 0,
          transform: "scale(1.1)", // Prevent white edges from blur
        }}
      />

      <div style={styles.card}>
        {/* Header Section */}
        <div style={styles.header}>
          <img
            src={`/Banners/${bannerId}.png`}
            alt="Banner"
            style={styles.bannerImage}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/Banners/Alpha.png";
            }}
          />
          <div style={styles.headerOverlay}>
            <div style={styles.avatarContainer}>
              <img
                src={`/ProfilePicture/${avatarId}.png`}
                alt="Avatar"
                style={styles.avatarImage}
              />
            </div>
            <div style={styles.headerText}>
              <h1 style={styles.username}>{user.username || "No Username"}</h1>
              <div style={styles.userTitle}>{equippedTitle}</div>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div style={styles.body}>
          <div style={styles.profileSection}>
            {!user.username && (
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

            <div style={{ display: "flex", gap: "20px" }}>
              <div style={{ ...styles.profileField, flex: 1 }}>
                <label style={styles.label}>Rank</label>
                <p style={styles.value}>{user.rank}</p>
              </div>

              <div style={{ ...styles.profileField, flex: 1 }}>
                <label style={styles.label}>Coins</label>
                <p style={styles.value}>{user.coins}</p>
              </div>
            </div>

            <div style={styles.profileField}>
              <label style={styles.label}>Member Since</label>
              <p style={styles.value}>
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div style={styles.sectionDivider} />

          {/* Customization Section */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ ...styles.label, marginBottom: "12px" }}>
              Edit Profile
            </h3>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Avatar</label>
              <select
                value={avatarId}
                onChange={(e) => {
                  const val = e.target.value;
                  setAvatarId(val);
                  handleSaveCustomization({ avatarId: val });
                }}
                style={styles.select}
              >
                {AVATARS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Banner</label>
              <select
                value={bannerId}
                onChange={(e) => {
                  const val = e.target.value;
                  setBannerId(val);
                  handleSaveCustomization({ bannerId: val });
                }}
                style={styles.select}
              >
                {BANNERS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Title</label>
              <select
                value={equippedTitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setEquippedTitle(val);
                  handleSaveCustomization({ equippedTitle: val });
                }}
                style={styles.select}
              >
                {TITLES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {customizationSaving && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  marginTop: "8px",
                }}
              >
                Saving...
              </p>
            )}

            {customizationMessage && !customizationSaving && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#22c55e",
                  marginTop: "8px",
                }}
              >
                {customizationMessage}
              </p>
            )}
          </div>

          <div style={styles.sectionDivider} />

          {/* Set Password Section */}
          <div
            style={{
              marginBottom: "24px",
            }}
          >
            <h3 style={{ ...styles.label, marginBottom: "12px" }}>Security</h3>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Set/Update Password</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  style={{ ...styles.input, flex: 1 }}
                />
                <button
                  onClick={handleSetPassword}
                  disabled={passwordLoading || !newPassword}
                  style={{
                    ...styles.button,
                    width: "auto",
                    marginBottom: 0,
                    padding: "0 16px",
                    opacity: passwordLoading || !newPassword ? 0.5 : 1,
                  }}
                >
                  {passwordLoading ? "..." : "Update"}
                </button>
              </div>
              {passwordMessage && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#22c55e",
                  }}
                >
                  {passwordMessage}
                </div>
              )}
              {passwordError && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#f2c2cb",
                  }}
                >
                  {passwordError}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push("/social")}
            style={{
              ...styles.button,
              background: "#1e232d",
              borderColor: "#2b3544",
            }}
          >
            Go to Social Hub
          </button>

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
    // background: "#0b0d10", // Removed to allow blurred background to show
    color: "#e7e9ed",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    padding: "20px",
    position: "relative", // Ensure z-index works for children
  } as React.CSSProperties,

  card: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "12px",
    overflow: "hidden", // Ensure banner doesn't overflow corners
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
    maxWidth: "540px",
    width: "100%",
    position: "relative",
    zIndex: 1,
  } as React.CSSProperties,

  header: {
    position: "relative",
    width: "100%",
    height: "180px",
    background: "#0b0d10",
  } as React.CSSProperties,

  bannerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.8,
  } as React.CSSProperties,

  headerOverlay: {
    position: "absolute",
    bottom: "-40px", // Pull avatar down to overlap body
    left: "0",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 10,
  } as React.CSSProperties,

  avatarContainer: {
    position: "relative",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    border: "4px solid #11141a", // Match card background to create "cutout" effect
    background: "#11141a",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  } as React.CSSProperties,

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as React.CSSProperties,

  headerText: {
    marginTop: "12px",
    textAlign: "center",
  } as React.CSSProperties,

  username: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#f5f7fb",
    margin: 0,
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  } as React.CSSProperties,

  userTitle: {
    fontSize: "14px",
    color: "#9aa3b5",
    fontWeight: 600,
    marginTop: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: "rgba(0,0,0,0.4)",
    padding: "4px 12px",
    borderRadius: "12px",
    backdropFilter: "blur(4px)",
  } as React.CSSProperties,

  body: {
    padding: "60px 36px 36px 36px", // Top padding accounts for overlapping avatar
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
    fontSize: "14px",
    color: "#e7e9ed",
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

  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #1f2a3a",
    background: "#0b0d10",
    color: "#f5f7fb",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
    marginBottom: "12px",
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

  sectionDivider: {
    height: "1px",
    background: "#1e232d",
    margin: "24px 0",
  } as React.CSSProperties,
};
