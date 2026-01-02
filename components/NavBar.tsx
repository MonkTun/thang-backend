import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

const links: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Download", href: "/download" },
  { label: "Learn More", href: "/learnmore" },
];

export default function NavBar() {
  const getWindow = (): any =>
    typeof globalThis !== "undefined" && (globalThis as any).window
      ? (globalThis as any).window
      : undefined;

  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check auth status on client only
    const checkAuth = () => {
      const win = getWindow();
      const token = win?.localStorage?.getItem("idToken") || null;
      const storedAvatar = win?.localStorage?.getItem("avatarId") || "Alpha";
      setIsAuthed(Boolean(token));
      setAvatarId(storedAvatar);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth); // Listen for cross-tab changes
    // Custom event for same-tab updates
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, [router.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const win = getWindow();
      if (!win) return;
      setIsMobile(win.innerWidth <= 768);
    };

    handleResize();
    const win = getWindow();
    win?.addEventListener("resize", handleResize);
    return () => win?.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleRoute = () => setMenuOpen(false);
    router.events.on("routeChangeComplete", handleRoute);
    return () => {
      router.events.off("routeChangeComplete", handleRoute);
    };
  }, [router.events]);

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link href="/" style={styles.brand}>
          <div style={styles.logoWrap}>
            <Image
              src="/ThangLogo.png"
              alt="Thang Logo"
              width={32}
              height={32}
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
          <span style={styles.brandText}>Thang</span>
        </Link>

        <nav
          style={{
            ...styles.nav,
            display: isMobile && menuOpen ? "flex" : isMobile ? "none" : "flex",
            ...(menuOpen && isMobile ? styles.navOpen : {}),
          }}
        >
          {links.map((link) => {
            const isActive = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  ...styles.navLink,
                  color: isActive ? "#f5f7fb" : "#c8cbd2",
                  borderColor: isActive ? "#0f62fe" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={styles.actions}>
          {isAuthed === null ? (
            <div style={styles.placeholder} />
          ) : isAuthed ? (
            <Link href="/profile" style={styles.avatarLink}>
              <img
                src={`/profilepicture/${avatarId}.png`}
                alt="Profile"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "2px solid #1f2a3a",
                  backgroundColor: "#11141a",
                  objectFit: "cover",
                }}
              />
            </Link>
          ) : (
            <Link href="/login" style={styles.secondaryButton}>
              Log in
            </Link>
          )}

          <button
            aria-label="Toggle menu"
            style={{
              ...styles.burger,
              display: isMobile ? "flex" : "none",
            }}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span style={{ ...styles.burgerBar, width: "18px" }} />
            <span style={{ ...styles.burgerBar, width: "14px" }} />
            <span style={{ ...styles.burgerBar, width: "20px" }} />
          </button>
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    background: "rgba(11, 13, 16, 0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #1e232d",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#f5f7fb",
    textDecoration: "none",
    fontWeight: 700,
    letterSpacing: "0.02em",
  } as React.CSSProperties,
  brandText: {
    fontSize: "16px",
    textTransform: "uppercase",
  },
  logoWrap: {
    width: 36,
    height: 36,
    display: "grid",
    placeItems: "center",
    background: "#0f1218",
    border: "1px solid #1e232d",
    borderRadius: "8px",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  } as React.CSSProperties,
  navOpen: {
    position: "absolute",
    top: "64px",
    left: 0,
    right: 0,
    padding: "12px 20px 16px",
    background: "rgba(11, 13, 16, 0.97)",
    borderBottom: "1px solid #1e232d",
    flexDirection: "column" as const,
    alignItems: "flex-start",
  },
  navLink: {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid transparent",
    textDecoration: "none",
    fontSize: "14px",
    transition: "all 0.15s ease",
  } as React.CSSProperties,
  avatarLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  } as React.CSSProperties,
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  primaryButton: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #1f2a3a",
    background: "#0f62fe",
    color: "#f5f7fb",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "14px",
  } as React.CSSProperties,
  secondaryButton: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #1e232d",
    background: "#11141a",
    color: "#f5f7fb",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "14px",
  } as React.CSSProperties,
  burger: {
    display: "none",
    flexDirection: "column",
    gap: "4px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #1e232d",
    background: "#11141a",
    cursor: "pointer",
  } as React.CSSProperties,
  burgerBar: {
    height: "2px",
    background: "#f5f7fb",
    borderRadius: "2px",
    display: "block",
  },
  placeholder: {
    width: "70px",
    height: "36px",
  },
};
