import React, { useMemo, useState } from "react";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import FooterNav from "../../components/FooterNav";

type LookupMode = "uid" | "username" | "inviteCode";

export default function AdminLookupPage() {
  const [mode, setMode] = useState<LookupMode>("username");
  const [value, setValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const placeholder = useMemo(() => {
    switch (mode) {
      case "uid":
        return "Firebase UID (e.g. rnyYdGe5ChfxFPR3Yn86WDJctqt1)";
      case "inviteCode":
        return "Invite code";
      case "username":
      default:
        return "Username";
    }
  }, [mode]);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const trimmed = value.trim();
      if (!trimmed) {
        setError("Enter a value to look up.");
        return;
      }

      const params = new URLSearchParams({ [mode]: trimmed });
      const res = await fetch(`/api/user/public?${params.toString()}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || `Request failed (${res.status})`);
        setResult(data);
        return;
      }

      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Head>
        <title>Admin Lookup | Thang</title>
      </Head>

      <NavBar />

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin User Lookup</h1>
          <div style={styles.hint}>
            Queries <code style={styles.inlineCode}>/api/user/public</code>
          </div>
        </div>

        <div style={styles.controls}>
          <div style={styles.modeRow}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="mode"
                value="username"
                checked={mode === "username"}
                onChange={() => setMode("username")}
              />
              <span style={styles.radioText}>username</span>
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="mode"
                value="uid"
                checked={mode === "uid"}
                onChange={() => setMode("uid")}
              />
              <span style={styles.radioText}>uid</span>
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="mode"
                value="inviteCode"
                checked={mode === "inviteCode"}
                onChange={() => setMode("inviteCode")}
              />
              <span style={styles.radioText}>inviteCode</span>
            </label>
          </div>

          <div style={styles.inputRow}>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              style={styles.input}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchUser();
              }}
            />
            <button
              onClick={fetchUser}
              style={isLoading ? styles.btnDisabled : styles.btn}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Lookup"}
            </button>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.resultBox}>
          <div style={styles.resultHeader}>Response JSON</div>
          <pre style={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
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
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "100px 20px 32px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "24px",
    borderBottom: "1px solid #166534",
    paddingBottom: "16px",
    gap: "12px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
  },
  hint: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  inlineCode: {
    color: "#93c5fd",
  },
  controls: {
    backgroundColor: "#111827",
    border: "1px solid #14532d",
    borderRadius: "4px",
    padding: "16px",
    marginBottom: "16px",
  },
  modeRow: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  radioLabel: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "12px",
    color: "#d1d5db",
  },
  radioText: {
    textTransform: "lowercase",
  },
  inputRow: {
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #374151",
    backgroundColor: "#000",
    color: "#d1d5db",
    fontSize: "12px",
  },
  btn: {
    padding: "10px 16px",
    border: "1px solid #22c55e",
    color: "#22c55e",
    background: "transparent",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "1px",
    borderRadius: "4px",
    fontSize: "12px",
  },
  btnDisabled: {
    padding: "10px 16px",
    border: "1px solid #374151",
    color: "#6b7280",
    background: "transparent",
    cursor: "not-allowed",
    textTransform: "uppercase",
    letterSpacing: "1px",
    borderRadius: "4px",
    fontSize: "12px",
  },
  errorBox: {
    backgroundColor: "#111827",
    border: "1px solid #ef4444",
    color: "#fecaca",
    borderRadius: "4px",
    padding: "12px",
    fontSize: "12px",
    marginBottom: "16px",
    whiteSpace: "pre-wrap",
  },
  resultBox: {
    backgroundColor: "#111827",
    border: "1px solid #374151",
    borderRadius: "4px",
    padding: "16px",
  },
  resultHeader: {
    fontSize: "10px",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  pre: {
    margin: 0,
    fontSize: "11px",
    color: "#d1d5db",
    overflowX: "auto",
    maxHeight: "520px",
  },
};
