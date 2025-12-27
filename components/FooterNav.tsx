import Link from "next/link";
import React from "react";

const styles: Record<string, React.CSSProperties> = {
  bar: {
    width: "100vw",
    marginLeft: "calc(50% - 50vw)",
    borderTop: "1px solid #1e232d",
    padding: "24px 0 16px",
    position: "relative",
    zIndex: 1,
    background: "rgba(11,13,16,0.9)",
    backdropFilter: "blur(4px)",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    flexWrap: "wrap" as const,
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    color: "#c8cbd2",
    fontSize: "14px",
  } as React.CSSProperties,
  brand: {
    fontWeight: 700,
    letterSpacing: "0.04em",
    color: "#f5f7fb",
  } as React.CSSProperties,
  links: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "14px",
  } as React.CSSProperties,
  link: {
    color: "#c8cbd2",
    textDecoration: "none",
    fontWeight: 600,
  } as React.CSSProperties,
};

export default function FooterNav() {
  return (
    <div style={styles.bar}>
      <div style={styles.inner}>
        <div style={styles.brand}>Thang</div>
        <div style={styles.links}>
          <Link href="/" style={styles.link}>
            Home
          </Link>
          <Link href="/download" style={styles.link}>
            Download
          </Link>
          <Link href="/learnmore" style={styles.link}>
            Learn more
          </Link>
          <Link href="/profile" style={styles.link}>
            Profile
          </Link>
          <Link href="/login" style={styles.link}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
