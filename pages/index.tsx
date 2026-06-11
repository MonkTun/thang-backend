import PixelSnow from "@/components/PixelSnow";
import FooterNav from "@/components/FooterNav";
import { useEffect, useRef } from "react";

const mechanics = [
  {
    title: "Freeze Bar",
    text: "Your body temperature drops when you stand still or get hit. Keep moving to stay warm — hit zero and you're Frozen.",
  },
  {
    title: "Teamplay & Revival",
    text: "Tagged teammates melt instantly. Deep-frozen ones must be carried back to the central Oven to be revived.",
  },
  {
    title: "Gunplay",
    text: "No ammo, no reloading. Guns melt after use. Hitscan freeze guns deal no damage — they only drain the Freeze Bar.",
  },
];

const features = [
  {
    title: "Ice Arena",
    text: "A symmetrical, medium-sized map built around a central Oven — the primary point of conflict and constant team fights.",
  },
  {
    title: "Roles & Perks",
    text: "No fixed classes. Pick Perks for mobility, support, pressure, or control to define exactly how you play.",
  },
  {
    title: "The Story",
    text: "Five polar-bear best friends. One found mind-controlling glasses and became The Hunter. The only way to stop them? Freeze them.",
  },
];

const milestones = [
  {
    label: "Q4 2025",
    stage: "Development begins",
    text: "Core combat, movement, and foundational systems are laid. Backend and client integration established.",
  },
  {
    label: "Q1 2026",
    stage: "Vertical slice",
    text: "A polished demo showcasing shooting, freezing, and basic AI in a small, focused map.",
  },
  {
    label: "Q2 2026",
    stage: "Alpha",
    text: "A wider content drop and a public alpha release with our first community testers.",
  },
  {
    label: "Q3 2026",
    stage: "Beta",
    text: "Performance tuning and final polish ahead of launch, with an open beta for all players.",
  },
  {
    label: "Q4 2026",
    stage: "Launch",
    text: "The official launch of THANG to the public. Time to stay un-frozen.",
    launch: true,
  },
];

const faqs = [
  {
    q: "What is the goal?",
    a: "It's a 5v5 freeze-tag match. Freeze the entire opposing team to win — and if you stop moving, you freeze too.",
  },
  {
    q: "How do I revive teammates?",
    a: "Tag them if they're Frozen. If they're Deep Frozen, carry them to the central Oven to warm them back up.",
  },
  {
    q: "Do guns deal damage?",
    a: "No. Guns only reduce the enemy's Freeze Bar. There's no health here — only body temperature.",
  },
  {
    q: "Are there classes?",
    a: "No fixed classes. You shape your playstyle with Perks: Mobility, Support, Pressure, and Control.",
  },
];

export default function IndexPage() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(0, ${
          window.scrollY * 0.18
        }px, 0)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <div className="fx-layer">
        <PixelSnow
          color="#ffffff"
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          direction={125}
          brightness={1}
          variant="snowflake"
          style={{ opacity: 0.4 }}
          speed={1.25}
          density={0.3}
        />
      </div>

      {/* Hero — just the wordmark */}
      <section className="hero">
        <div ref={parallaxRef} className="hero__media" />
        <div className="hero__scrim" />
        <div className="hero__inner">
          <h1 className="hero__title reveal">THANG!</h1>
        </div>
      </section>

      {/* Core mechanics */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="kicker">Core Gameplay</p>
            <h2 className="h2">If you stop moving, you freeze.</h2>
            <p className="lead">
              THANG is a 5v5 team battle where the goal is to freeze the entire
              opposing team. Play alone and you lose — survival is a team sport.
            </p>
          </div>
          <div className="grid">
            {mechanics.map((m, i) => (
              <article key={m.title} className={`card reveal d${i + 1}`}>
                <span className="card__index">{`0${i + 1}`}</span>
                <h3 className="card__title">{m.title}</h3>
                <p className="card__text">{m.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section--tight">
        <div className="container">
          <div className="grid">
            {features.map((f, i) => (
              <article key={f.title} className={`card reveal d${i + 1}`}>
                <h3 className="card__title">{f.title}</h3>
                <p className="card__text">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="kicker">Roadmap</p>
            <h2 className="h2">Road to launch</h2>
            <p className="lead">
              How we're sequencing development and the major milestones along
              the way.
            </p>
          </div>
          <div className="timeline">
            {milestones.map((m) => (
              <div
                key={m.label}
                className={`tl-item${m.launch ? " is-launch" : ""}`}
              >
                <p className="tl-label">{m.label}</p>
                <h3 className="tl-stage">{m.stage}</h3>
                <p className="tl-text">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="kicker">FAQ</p>
            <h2 className="h2">Answers before you drop in</h2>
          </div>
          <div className="grid grid--2">
            {faqs.map((f, i) => (
              <article key={f.q} className={`card reveal d${(i % 4) + 1}`}>
                <h3 className="card__title">{f.q}</h3>
                <p className="card__text">{f.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FooterNav />
    </div>
  );
}
