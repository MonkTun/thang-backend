import PixelSnow from "@/components/PixelSnow";
import FooterNav from "@/components/FooterNav";

const platforms = [
  { name: "Windows", description: "64-bit installer — TBA" },
  { name: "macOS", description: "Universal build — TBA" },
  { name: "Linux", description: "AppImage build — TBA" },
];

export default function DownloadPage() {
  return (
    <div>
      <div className="fx-layer">
        <PixelSnow
          color="#ffffff"
          flakeSize={0.18}
          speed={1.25}
          density={0.2}
          direction={125}
          brightness={1}
          variant="round"
          style={{ opacity: 0.17 }}
        />
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="kicker">Downloads</p>
            <h2 className="h2">Downloads are coming soon</h2>
            <p className="lead">
              Builds aren't available just yet. When THANG is ready to play,
              you'll grab it right here.
            </p>
          </div>

          <div className="grid">
            {platforms.map((p, i) => (
              <article key={p.name} className={`card dl-card reveal d${i + 1}`}>
                <span className="dl-card__icon" aria-hidden>
                  ❄
                </span>
                <div>
                  <h3 className="card__title">{p.name}</h3>
                  <p className="card__text">{p.description}</p>
                </div>
                <span className="dl-status">Coming soon</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FooterNav />
    </div>
  );
}
