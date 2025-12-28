import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div style={styles.container}>
      <Head>
        <title>Privacy Policy - Thang</title>
      </Head>
      <div style={styles.card}>
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.date}>Last Updated: December 28, 2025</p>

        <section style={styles.section}>
          <h2 style={styles.heading}>1. Introduction</h2>
          <p style={styles.text}>
            Welcome to Thang ("we," "our," or "us"). We are committed to
            protecting your privacy. This Privacy Policy explains how we
            collect, use, and safeguard your information when you visit our
            website and play our game.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>2. Information We Collect</h2>
          <p style={styles.text}>
            We collect information that you provide directly to us, such as when
            you create an account, update your profile, or contact us for
            support. This may include:
          </p>
          <ul style={styles.list}>
            <li>Email address</li>
            <li>Username</li>
            <li>Password (encrypted)</li>
            <li>Game data (scores, progress, inventory)</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>3. How We Use Your Information</h2>
          <p style={styles.text}>We use the information we collect to:</p>
          <ul style={styles.list}>
            <li>Provide, maintain, and improve our game services.</li>
            <li>Process your registration and manage your account.</li>
            <li>Respond to your comments, questions, and requests.</li>
            <li>Monitor and analyze trends, usage, and activities.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>4. Third-Party Services</h2>
          <p style={styles.text}>
            We use third-party services for authentication and data storage:
          </p>
          <ul style={styles.list}>
            <li>
              <strong>Google Firebase:</strong> Used for authentication and
              hosting.
            </li>
            <li>
              <strong>MongoDB:</strong> Used for storing game data and user
              profiles.
            </li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>5. Contact Us</h2>
          <p style={styles.text}>
            If you have any questions about this Privacy Policy, please contact
            us.
          </p>
        </section>

        <div style={styles.footer}>
          <Link href="/login" style={styles.link}>
            Back to Login
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
