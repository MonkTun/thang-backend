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
];

export default function NavBar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router.events]);

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link href="/" className="nav__brand" onClick={() => setMenuOpen(false)}>
          <span className="nav__logo">
            <Image
              src="/ThangLogo.png"
              alt="Thang logo"
              width={30}
              height={30}
              priority
              style={{ objectFit: "contain" }}
            />
          </span>
          <span>Thang</span>
        </Link>

        <nav className={`nav__links${menuOpen ? " is-open" : ""}`}>
          {links.map((link) => {
            const isActive = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav__link${isActive ? " is-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="nav__burger"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
