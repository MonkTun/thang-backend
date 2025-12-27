import Link from "next/link";
import PixelSnow from "@/components/PixelSnow";
import FooterNav from "@/components/FooterNav";
import { useEffect, useRef } from "react";

export default function IndexPage() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translate3d(0, ${
          scrolled * 0.2
        }px, 0)`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.fxLayer}>
        <PixelSnow
          color="#ffffff"
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          direction={125}
          brightness={1}
          variant="snowflake"
          style={{ opacity: 0.38 }}
          speed={1.25}
          density={0.3}
        />
      </div>

      <div style={styles.main}>
        <section style={styles.heroBanner}>
          <div ref={parallaxRef} style={styles.heroMediaFull} />
          <div style={styles.heroGradient} />

          <div style={styles.heroContentOverlay}>
            <p style={styles.kicker}>
              Action RPG • Multiplayer • Cross-platform
            </p>
            <h1 style={styles.title}>Forge your legend in Thang</h1>
            <p style={styles.subtitle}>
              Dive into fast-paced battles, craft rare gear, and carve your path
              through a living world. Squad up with friends or conquer alone —
              the choice is yours.
            </p>
            <div style={styles.ctaRow}>
              <Link
                href="/download"
                style={{ ...styles.button, ...styles.primary }}
              >
                Download
              </Link>
              <Link
                href="/learnmore"
                style={{ ...styles.button, ...styles.secondary }}
              >
                Learn more
              </Link>
            </div>
            <div style={styles.platforms}>
              PC • Mac • Linux • Coming soon to Steam Deck
            </div>
          </div>
        </section>

        <section style={styles.infoSection}>
          <div style={styles.infoHeader}>
            <p style={styles.kicker}>Why play</p>
            <h2 style={styles.infoTitle}>Built for squads, tuned for skill</h2>
            <p style={styles.infoSubtitle}>
              Movement-cancel combos, reactive AI, and loot that respects your
              time. Thang rewards sharp play and keeps your squad synced across
              every platform.
            </p>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoCardTitle}>Combat depth</h3>
              <p style={styles.infoText}>
                Parries, i-frame dodges, weapon stances, and ultimates that
                chain into co-op finishers.
              </p>
            </div>
            <div style={styles.infoCard}>
              <h3 style={styles.infoCardTitle}>Progression that lasts</h3>
              <p style={styles.infoText}>
                Seasonal ladders without wipes on your core collection;
                cosmetics and builds travel with you.
              </p>
            </div>
            <div style={styles.infoCard}>
              <h3 style={styles.infoCardTitle}>Live world</h3>
              <p style={styles.infoText}>
                Rotating events, faction wars, and dungeons that remix layouts
                each week.
              </p>
            </div>
          </div>
        </section>

        <section style={styles.features}>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Skill-first combat</h3>
            <p style={styles.featureText}>
              Tight, timing-based battles with dodge-rolls, parries, and
              specials that reward mastery.
            </p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Co-op ready</h3>
            <p style={styles.featureText}>
              Jump in with friends, sync progress, and share loot via
              cross-platform play.
            </p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>Evolving world</h3>
            <p style={styles.featureText}>
              Seasonal events, rotating dungeons, and a living economy that
              keeps the grind fresh.
            </p>
          </div>
        </section>

        <section style={styles.faqSection}>
          <div style={styles.infoHeader}>
            <p style={styles.kicker}>FAQ</p>
            <h2 style={styles.infoTitle}>Answers before you drop in</h2>
          </div>
          <div style={styles.faqGrid}>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQuestion}>Is Thang free-to-play?</h4>
              <p style={styles.faqAnswer}>
                Yes. Cosmetics are optional and progression is skill-earned, not
                paywalled.
              </p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQuestion}>Does it support cross-play?</h4>
              <p style={styles.faqAnswer}>
                PC, Mac, and Linux play together today. Steam Deck optimizations
                are in flight.
              </p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQuestion}>
                Will my seasonal progress reset?
              </h4>
              <p style={styles.faqAnswer}>
                Seasonal ladders reset rankings, but your core gear, cosmetics,
                and unlocks stay.
              </p>
            </div>
            <div style={styles.faqItem}>
              <h4 style={styles.faqQuestion}>Can I solo the endgame?</h4>
              <p style={styles.faqAnswer}>
                Yes, but squads clear faster. Boss mechanics scale for solo and
                co-op.
              </p>
            </div>
          </div>
        </section>

        <div style={styles.footerSpacer} />
      </div>

      <FooterNav />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background:
      "radial-gradient(circle at 20% 20%, rgba(31, 97, 255, 0.08), transparent 28%)," +
      "radial-gradient(circle at 80% 10%, rgba(118, 75, 162, 0.1), transparent 30%)," +
      "#0b0d10",
    minHeight: "100vh",
    padding: "0 20px 80px",
    color: "#e7e9ed",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
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
  heroBanner: {
    position: "relative",
    minHeight: "760px",
    overflow: "hidden",
    boxShadow: "0 30px 100px rgba(0,0,0,0.45)",
    margin: "0 auto 32px",
    maxWidth: "100%",
    width: "100%",
    isolation: "isolate",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  heroMediaFull: {
    position: "absolute",
    top: "-200px",
    bottom: "-200px",
    left: 0,
    right: 0,
    backgroundImage: "url('/ThangScreenshot.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    willChange: "transform",
    zIndex: 0,
  } as React.CSSProperties,
  heroGradient: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(7,9,12,0.85) 0%, rgba(7,9,12,0.65) 40%, rgba(7,9,12,0.9) 100%)",
    backdropFilter: "blur(2px)",
    zIndex: 1,
  } as React.CSSProperties,
  heroContentOverlay: {
    position: "relative",
    zIndex: 2,
    padding: "44px 32px 38px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "860px",
    width: "100%",
    color: "#f5f9ff",
    textShadow: "0 10px 30px rgba(0,0,0,0.55)",
    alignItems: "center",
    textAlign: "center" as const,
    margin: "0 auto",
  } as React.CSSProperties,
  kicker: {
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "12px",
    color: "#d2ddff",
    margin: 0,
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: "46px",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    background:
      "linear-gradient(120deg, rgba(255,255,255,0.96), rgba(193,219,255,0.9), rgba(255,255,255,0.98))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    filter: "drop-shadow(0 14px 38px rgba(0,0,0,0.45))",
  } as React.CSSProperties,
  subtitle: {
    margin: 0,
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#e2e7f3",
  } as React.CSSProperties,
  ctaRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap" as const,
    marginTop: "4px",
    justifyContent: "center",
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
  platforms: {
    marginTop: "4px",
    color: "#98a2b3",
    fontSize: "13px",
  } as React.CSSProperties,
  features: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "24px",
    position: "relative",
    zIndex: 1,
    width: "100%",
    alignItems: "stretch",
    justifyItems: "stretch",
  } as React.CSSProperties,
  featureCard: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "8px",
    padding: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    height: "100%",
  } as React.CSSProperties,
  featureTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    color: "#f5f7fb",
  } as React.CSSProperties,
  featureText: {
    margin: 0,
    color: "#c8cbd2",
    lineHeight: 1.5,
    fontSize: "14px",
  } as React.CSSProperties,
  infoSection: {
    maxWidth: "1100px",
    margin: "64px auto 24px",
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  } as React.CSSProperties,
  infoHeader: {
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  } as React.CSSProperties,
  infoTitle: {
    margin: 0,
    fontSize: "28px",
    letterSpacing: "-0.01em",
    color: "#f5f7fb",
  } as React.CSSProperties,
  infoSubtitle: {
    margin: 0,
    fontSize: "15px",
    color: "#c8cbd2",
    maxWidth: "960px",
    lineHeight: 1.6,
  } as React.CSSProperties,
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "24px",
    width: "100%",
    alignItems: "stretch",
    justifyItems: "stretch",
  } as React.CSSProperties,
  infoCard: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    height: "100%",
  } as React.CSSProperties,
  infoCardTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    color: "#f5f7fb",
  } as React.CSSProperties,
  infoText: {
    margin: 0,
    color: "#c8cbd2",
    lineHeight: 1.5,
    fontSize: "14px",
  } as React.CSSProperties,
  faqSection: {
    maxWidth: "1100px",
    margin: "72px auto 0",
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    width: "100%",
  } as React.CSSProperties,
  faqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: "24px",
    width: "100%",
    alignItems: "stretch",
    justifyItems: "stretch",
  } as React.CSSProperties,
  faqItem: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "10px",
    padding: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    width: "100%",
    height: "100%",
  } as React.CSSProperties,
  faqQuestion: {
    margin: "0 0 6px 0",
    fontSize: "15px",
    color: "#f5f7fb",
  } as React.CSSProperties,
  faqAnswer: {
    margin: 0,
    fontSize: "14px",
    color: "#c8cbd2",
    lineHeight: 1.5,
  } as React.CSSProperties,
  footerSpacer: {
    height: "48px",
  } as React.CSSProperties,
};
