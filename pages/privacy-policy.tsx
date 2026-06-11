import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div style={styles.container}>
      <Head>
        <title>Privacy Policy - Thang</title>
        <meta
          name="description"
          content="Privacy Policy for Thang, describing what player data we collect and how it is used."
        />
      </Head>
      <div style={styles.card}>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.date}>Last Updated: June 11, 2026</p>

        <section style={styles.section}>
          <h2 style={styles.heading}>1. Introduction</h2>
          <p style={styles.text}>
            This Privacy Policy explains how Thang ("we," "our," or "us")
            collects, uses, and protects your information when you play our
            game. We are committed to keeping the amount of personal data we
            handle to a minimum.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>2. Information We Collect</h2>
          <p style={styles.text}>
            We rely on Epic Online Services (EOS) for account login and to store
            basic player data. We do not operate our own account system or
            collect passwords. The information associated with your gameplay may
            include:
          </p>
          <ul style={styles.list}>
            <li>An Epic Online Services account identifier.</li>
            <li>A display name or username.</li>
            <li>
              Basic player data such as game progress, settings, and in-game
              status.
            </li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>3. How We Use Your Information</h2>
          <p style={styles.text}>We use this information to:</p>
          <ul style={styles.list}>
            <li>Authenticate you and let you log in to the game.</li>
            <li>Save and restore your in-game progress and settings.</li>
            <li>Enable core multiplayer and social features.</li>
            <li>Maintain, troubleshoot, and improve the game.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>4. Third-Party Services</h2>
          <p style={styles.text}>
            We use Epic Online Services for authentication and basic player
            data. Your use of these features is also subject to Epic's own
            policies. Please review Epic Games' Privacy Policy for details on how
            they handle your information:
          </p>
          <ul style={styles.list}>
            <li>
              <a
                href="https://www.epicgames.com/site/en-US/privacypolicy"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                Epic Games Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>5. Data Retention and Your Rights</h2>
          <p style={styles.text}>
            We retain basic player data only for as long as it is needed to
            provide the game and its features, or as required by applicable law.
            Subject to applicable privacy laws, you may request access to, or
            deletion of, the data associated with your account at any time. To
            make such a request, contact us using the details in the "Contact
            Us" section below, and we will respond within the timeframe required
            by applicable law.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>6. Children's Privacy</h2>
          <p style={styles.text}>
            Our game is not directed to children under the age required by
            applicable law, and we do not knowingly collect personal information
            from them.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>7. Changes to This Policy</h2>
          <p style={styles.text}>
            We may update this Privacy Policy from time to time. Any changes will
            be reflected by the "Last Updated" date above.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>8. Contact Us</h2>
          <p style={styles.text}>
            Thang is developed and operated by Overdawn Studio, which is the
            party responsible for the personal data described in this Privacy
            Policy. If you have any questions about this Privacy Policy, wish to
            exercise your privacy rights, or have any data protection inquiries
            &mdash; including requests to access or delete the data associated
            with your account &mdash; you can reach us at:
          </p>
          <ul style={styles.list}>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:playoverdawn@gmail.com" style={styles.link}>
                playoverdawn@gmail.com
              </a>
            </li>
            <li>
              <strong>Phone:</strong> +1 (213) 458-1024
            </li>
          </ul>
          <p style={styles.text}>
            We handle all data protection inquiries and deletion requests in
            accordance with applicable privacy laws.
          </p>
        </section>

        <div style={styles.footer}>
          <Link href="/" style={styles.link}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0b0d10",
    color: "#e7e9ed",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  } as React.CSSProperties,
  card: {
    background: "#11141a",
    border: "1px solid #1e232d",
    borderRadius: "8px",
    padding: "40px",
    maxWidth: "800px",
    width: "100%",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
  } as React.CSSProperties,
  title: {
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "10px",
    color: "#f5f7fb",
  } as React.CSSProperties,
  date: {
    fontSize: "14px",
    color: "#98a2b3",
    marginBottom: "40px",
  } as React.CSSProperties,
  section: {
    marginBottom: "30px",
  } as React.CSSProperties,
  heading: {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "15px",
    color: "#f5f7fb",
  } as React.CSSProperties,
  text: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#c8cbd2",
    marginBottom: "15px",
  } as React.CSSProperties,
  list: {
    listStyleType: "disc",
    paddingLeft: "20px",
    color: "#c8cbd2",
    lineHeight: "1.6",
  } as React.CSSProperties,
  footer: {
    marginTop: "60px",
    borderTop: "1px solid #1e232d",
    paddingTop: "20px",
  } as React.CSSProperties,
  link: {
    color: "#0f62fe",
    textDecoration: "none",
    fontSize: "14px",
  } as React.CSSProperties,
};
