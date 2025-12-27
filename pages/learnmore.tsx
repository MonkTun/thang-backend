import Link from "next/link";
import PixelSnow from "@/components/PixelSnow";
import FooterNav from "@/components/FooterNav";

export default function LearnMorePage() {
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
        <div style={styles.timelineSection}>
          <div style={styles.timelineHeader}>
            <p style={styles.kicker}>Roadmap</p>
            <h2 style={styles.timelineTitle}>Road to launch</h2>
            <p style={styles.timelineSubtitle}>
              How we are sequencing development milestones through 2025.
            </p>
          </div>
          <div style={styles.timelineList}>
            <div style={styles.timelineItem}>
              <div style={styles.timelineDot} />
              <div style={styles.timelineContent}>
                <p style={styles.timelineLabel}>Q1 2025</p>
                <h3 style={styles.timelineStage}>Development begins</h3>
                <p style={styles.timelineText}>
                  Core combat, movement, and foundational systems come online.
                  Team builds tooling and pipelines.
                </p>
              </div>
            </div>
            <div style={styles.timelineItem}>
              <div style={styles.timelineDot} />
              <div style={styles.timelineContent}>
                <p style={styles.timelineLabel}>Q2 2025</p>
                <h3 style={styles.timelineStage}>Vertical slice</h3>
                <p style={styles.timelineText}>
                  A polished demo showcasing combat, one dungeon, and core
                  progression for feedback.
                </p>
              </div>
            </div>
            <div style={styles.timelineItem}>
              <div style={styles.timelineDot} />
              <div style={styles.timelineContent}>
                <p style={styles.timelineLabel}>Q3 2025</p>
                <h3 style={styles.timelineStage}>Alpha</h3>
                <p style={styles.timelineText}>
                  Wider content drop, co-op sessions, and economy balancing with
                  early community testers.
                </p>
              </div>
            </div>
            <div style={styles.timelineItem}>
              <div style={styles.timelineDot} />
              <div style={styles.timelineContent}>
                <p style={styles.timelineLabel}>Q4 2025</p>
                <h3 style={styles.timelineStage}>Beta</h3>
                <p style={styles.timelineText}>
                  Performance tuning, live events rehearsal, and final polish
                  ahead of launch.
                </p>
              </div>
            </div>
          </div>
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
    margin: "0 auto 28px",
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
    margin: "24px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "24px",
    position: "relative",
    zIndex: 1,
    alignItems: "stretch",
    justifyItems: "stretch",
  } as React.CSSProperties,
  card: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    height: "100%",
  } as React.CSSProperties,
  sectionTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
  },
  sectionText: {
    margin: 0,
    color: "#c8cbd2",
    lineHeight: 1.5,
    fontSize: "14px",
  },
  list: {
    margin: "8px 0 0 18px",
    color: "#c8cbd2",
    lineHeight: 1.6,
    fontSize: "14px",
  } as React.CSSProperties,
  moreDevSection: {
    maxWidth: "1100px",
    margin: "22px auto 0",
    position: "relative",
    zIndex: 1,
  } as React.CSSProperties,
  mediaCard: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
    alignItems: "center",
  } as React.CSSProperties,
  videoFrame: {
    position: "relative",
    width: "100%",
    paddingBottom: "56.25%",
    overflow: "hidden",
    borderRadius: "10px",
    background: "#0d1015",
    border: "1px solid #1e232d",
  } as React.CSSProperties,
  iframe: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: 0,
    borderRadius: "10px",
  } as React.CSSProperties,
  trailerCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  } as React.CSSProperties,
  trailerTitle: {
    margin: "0",
    fontSize: "22px",
    letterSpacing: "-0.01em",
    color: "#f5f7fb",
  } as React.CSSProperties,
  trailerSubtitle: {
    margin: 0,
    fontSize: "15px",
    color: "#c8cbd2",
    lineHeight: 1.6,
  } as React.CSSProperties,
  trailerCtaRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap" as const,
    marginTop: "4px",
  } as React.CSSProperties,
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 18px",
    borderRadius: "6px",
    fontWeight: 700,
    textDecoration: "none",
    fontSize: "14px",
    border: "1px solid transparent",
    transition:
      "transform 0.08s ease, background 0.15s ease, border-color 0.15s ease",
  } as React.CSSProperties,
  primary: {
    background: "#0f62fe",
    color: "#f5f7fb",
    borderColor: "#1f2a3a",
  } as React.CSSProperties,
  secondary: {
    background: "#11141a",
    color: "#f5f7fb",
    borderColor: "#1e232d",
  } as React.CSSProperties,
  timelineSection: {
    maxWidth: "1100px",
    margin: "28px auto 0",
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
    position: "relative",
    zIndex: 1,
  } as React.CSSProperties,
  timelineHeader: {
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "14px",
    alignItems: "center",
  } as React.CSSProperties,
  timelineTitle: {
    margin: 0,
    fontSize: "22px",
    letterSpacing: "-0.01em",
    color: "#f5f7fb",
  } as React.CSSProperties,
  timelineSubtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#c8cbd2",
    lineHeight: 1.5,
  } as React.CSSProperties,
  timelineList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  } as React.CSSProperties,
  timelineItem: {
    position: "relative",
    paddingLeft: "18px",
    marginLeft: "6px",
    borderLeft: "1px solid #1f2a3a",
  } as React.CSSProperties,
  timelineDot: {
    position: "absolute",
    left: "-7px",
    top: "6px",
    width: "12px",
    height: "12px",
    borderRadius: "999px",
    background: "#8aa2ff",
    border: "2px solid #0b0d10",
    boxShadow: "0 0 0 4px rgba(138,162,255,0.14)",
  } as React.CSSProperties,
  timelineContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  } as React.CSSProperties,
  timelineLabel: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#9bb1ff",
  } as React.CSSProperties,
  timelineStage: {
    margin: 0,
    fontSize: "16px",
    color: "#f5f7fb",
  } as React.CSSProperties,
  timelineText: {
    margin: 0,
    fontSize: "14px",
    color: "#c8cbd2",
    lineHeight: 1.5,
  } as React.CSSProperties,
  footerSpacer: {
    height: "48px",
  } as React.CSSProperties,
};
