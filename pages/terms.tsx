import Head from "next/head";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div style={styles.container}>
      <Head>
        <title>Terms of Service - Thang</title>
      </Head>
      <div style={styles.card}>
        <h1 style={styles.title}>Terms of Service</h1>
        <p style={styles.date}>Last Updated: December 28, 2025</p>

        <section style={styles.section}>
          <h2 style={styles.heading}>1. Acceptance of Terms</h2>
          <p style={styles.text}>
            By accessing or using Thang ("the Game"), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please
            do not use our services.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>2. User Accounts</h2>
          <p style={styles.text}>
            To access certain features of the Game, you may be required to
            create an account. You are responsible for maintaining the
            confidentiality of your account and password. You agree to accept
            responsibility for all activities that occur under your account.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>3. User Conduct</h2>
          <p style={styles.text}>
            You agree not to engage in any of the following prohibited
            activities:
          </p>
          <ul style={styles.list}>
            <li>Cheating, hacking, or using unauthorized software.</li>
            <li>Harassing, threatening, or defaming other users.</li>
            <li>Impersonating any person or entity.</li>
            <li>Interfering with or disrupting the Game services.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>4. Intellectual Property</h2>
          <p style={styles.text}>
            The Game and its original content, features, and functionality are
            owned by Thang and are protected by international copyright,
            trademark, patent, trade secret, and other intellectual property or
            proprietary rights laws.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>5. Termination</h2>
          <p style={styles.text}>
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason whatsoever, including without
            limitation if you breach the Terms.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.heading}>6. Limitation of Liability</h2>
          <p style={styles.text}>
            In no event shall Thang, nor its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses.
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
