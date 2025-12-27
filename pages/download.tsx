import Link from "next/link";
import PixelSnow from "@/components/PixelSnow";
import FooterNav from "@/components/FooterNav";

export default function DownloadPage() {
  const platforms = [
    {
      name: "Windows",
      description: "64-bit installer — TBA",
      action: "Coming soon",
      href: "#",
    },
    {
      name: "macOS",
      description: "Universal build — TBA",
      action: "Coming soon",
      href: "#",
    },
    {
      name: "Linux",
      description: "AppImage build — TBA",
      action: "Coming soon",
      href: "#",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.fxLayer}>
        <PixelSnow
          color="#ffffff"
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1.25}
          density={0.3}
          direction={125}
          brightness={1}
          variant="snowflake"
          style={{ opacity: 0.34 }}
        />
        <div style={styles.fxMask} />
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <p style={styles.kicker}>Downloads</p>
          <h1 style={styles.title}>Downloads are coming soon</h1>
          <p style={styles.subtitle}>
            We are finalizing the builds for every platform. Check back shortly
            for direct download links.
          </p>
        </div>

        <div style={styles.grid}>
          {platforms.map((p) => (
            <div key={p.name} style={styles.card}>
              <div>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <p style={styles.cardText}>{p.description}</p>
              </div>
              <Link
                href={p.href}
                style={{ ...styles.cardButton, ...styles.disabled }}
                aria-disabled
              >
                {p.action}
              </Link>
            </div>
          ))}
        </div>

        <div style={styles.footerSpacer} />
      </div>

      <FooterNav />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 20% 20%, rgba(31, 97, 255, 0.08), transparent 28%)," +
      "radial-gradient(circle at 80% 10%, rgba(118, 75, 162, 0.1), transparent 30%)," +
      "#0b0d10",
    color: "#e7e9ed",
    padding: "40px 20px 80px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0px",
  } as React.CSSProperties,
  fxLayer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  } as React.CSSProperties,
  fxMask: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(11,13,16,0.75) 0%, rgba(11,13,16,0.3) 40%, rgba(11,13,16,0.9) 100%)",
  } as React.CSSProperties,
  header: {
    maxWidth: "1100px",
    margin: "0 auto 32px",
    position: "relative",
    zIndex: 1,
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  kicker: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "12px",
    color: "#d2ddff",
  },
  title: {
    margin: "6px 0 10px 0",
    fontSize: "32px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    color: "#c8cbd2",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  grid: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gap: "24px",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    position: "relative",
    zIndex: 1,
  } as React.CSSProperties,
  card: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "10px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  } as React.CSSProperties,
  cardTitle: {
    margin: "0 0 6px 0",
    fontSize: "18px",
  },
  cardText: {
    margin: 0,
    color: "#c8cbd2",
    lineHeight: 1.5,
    fontSize: "14px",
  },
  cardButton: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 14px",
    background: "#0f62fe",
    borderRadius: "6px",
    border: "1px solid #1f2a3a",
    color: "#f5f7fb",
    fontWeight: 700,
    textDecoration: "none",
    fontSize: "14px",
  } as React.CSSProperties,
  disabled: {
    opacity: 0.45,
    pointerEvents: "none",
    cursor: "not-allowed",
    background: "#1a1f2a",
    borderColor: "#262c38",
  } as React.CSSProperties,
  footerSpacer: {
    height: "48px",
  } as React.CSSProperties,
};
