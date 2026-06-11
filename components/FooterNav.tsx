import Link from "next/link";

const links = [
  { label: "Download", href: "/download" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
];

export default function FooterNav() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__brand">Thang</span>
        <nav className="footer__links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="footer__link">
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="footer__legal">© 2026 Thang · Stay un-frozen.</p>
      </div>
    </footer>
  );
}
