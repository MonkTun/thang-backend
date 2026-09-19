import Link from "next/link";

type FooterLink = { label: string; href: string };

const DEFAULT_LINKS: FooterLink[] = [
  { label: "Blog", href: "/blog" },
  { label: "Download", href: "/download" },
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
];

const DEFAULT_LEGAL = "© 2026 Thang · Stay un-frozen.";

type Props = {
  brand?: string;
  links?: FooterLink[];
  legal?: string;
  /** Drop the 40px top margin — the Footer block's section sets the gap. */
  flush?: boolean;
};

// The coded pages (/blog, the admin tools) render it bare; the site pages
// pass the Footer block's props (components/blog/atoms/Footer.tsx).
export default function FooterNav({
  brand = "Thang",
  links = DEFAULT_LINKS,
  legal = DEFAULT_LEGAL,
  flush = false,
}: Props) {
  return (
    <footer className="footer" style={flush ? { marginTop: 0 } : undefined}>
      <div className="footer__inner">
        <span className="footer__brand">{brand}</span>
        <nav className="footer__links">
          {links.map((l, i) => (
            <Link key={`${l.href}-${i}`} href={l.href} className="footer__link">
              {l.label}
            </Link>
          ))}
        </nav>
        {legal && <p className="footer__legal">{legal}</p>}
      </div>
    </footer>
  );
}
