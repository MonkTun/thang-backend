import Head from "next/head";
import { useState } from "react";
import styles from "@/styles/brand.module.css";

/* ---- color palette (values kept in sync with styles/globals.css) ---- */
type Swatch = { name: string; varName: string; value: string; alpha?: boolean };

const colorGroups: { title: string; colors: Swatch[] }[] = [
  {
    title: "Surfaces",
    colors: [
      { name: "Midnight", varName: "--bg", value: "#05070e" },
      { name: "Elevated", varName: "--bg-elev", value: "#0a0f1b" },
      { name: "Glass", varName: "--glass", value: "rgba(255,255,255,.035)", alpha: true },
      { name: "Glass strong", varName: "--glass-strong", value: "rgba(255,255,255,.06)", alpha: true },
    ],
  },
  {
    title: "Ink — Text",
    colors: [
      { name: "Frost", varName: "--frost", value: "#e2f3ff" },
      { name: "Ink", varName: "--ink", value: "#eaf1fb" },
      { name: "Ink dim", varName: "--ink-dim", value: "#a3b4cc" },
      { name: "Ink faint", varName: "--ink-faint", value: "#6c7d95" },
    ],
  },
  {
    title: "Ice — Primary",
    colors: [
      { name: "Ice", varName: "--ice", value: "#84dcff" },
      { name: "Ice strong", varName: "--ice-strong", value: "#36b4ff" },
      { name: "Ice deep", varName: "--ice-deep", value: "#1f7fff" },
    ],
  },
  {
    title: "Ember — Accent",
    colors: [
      { name: "Ember soft", varName: "--ember-soft", value: "#ffb672" },
      { name: "Ember", varName: "--ember", value: "#ff9344" },
      { name: "Ember deep", varName: "--ember-deep", value: "#ff6a2c" },
    ],
  },
  {
    title: "Hairlines",
    colors: [
      { name: "Line", varName: "--line", value: "rgba(126,188,255,.12)", alpha: true },
      { name: "Line strong", varName: "--line-strong", value: "rgba(126,188,255,.26)", alpha: true },
    ],
  },
];

const displayWeights = [400, 600, 700, 800, 900];
const bodyWeights = [400, 500, 600, 700, 800];

export default function BrandPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopied(value);
    window.setTimeout(() => setCopied((c) => (c === value ? null : c)), 1200);
  };

  return (
    <div>
      <Head>
        <title>Thang — Brand</title>
      </Head>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="kicker">Brand</p>
            <h2 className="h2">Fonts &amp; colors</h2>
          </div>

          {/* Fonts */}
          <div className={styles.typeGrid}>
            <div className={styles.typePanel}>
              <div className={styles.typeHead}>
                <h3 className={styles.typeName}>Grandstander</h3>
                <span className={styles.typeRole}>Display</span>
              </div>
              <p className={styles.typeSample}>Stay un-frozen.</p>
              {displayWeights.map((w) => (
                <div key={w} className={styles.ladderItem}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: w, fontSize: 26, color: "var(--frost)" }}>
                    Freeze or be frozen
                  </span>
                  <span className={styles.ladderLabel}>{w}</span>
                </div>
              ))}
            </div>

            <div className={styles.typePanel}>
              <div className={styles.typeHead}>
                <h3 className={styles.typeName}>Nunito</h3>
                <span className={styles.typeRole}>Body</span>
              </div>
              <p className={styles.bodySample}>
                Move to stay warm, carry frozen teammates to the Oven, and never
                fight alone.
              </p>
              {bodyWeights.map((w) => (
                <div key={w} className={styles.ladderItem}>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: w, fontSize: 20, color: "var(--frost)" }}>
                    The quick brown fox
                  </span>
                  <span className={styles.ladderLabel}>{w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className={styles.colorWrap}>
            {colorGroups.map((group) => (
              <div key={group.title} className={styles.group}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <div className={styles.swatchGrid}>
                  {group.colors.map((c) => (
                    <button
                      key={c.varName}
                      type="button"
                      className={styles.swatch}
                      onClick={() => copy(c.value)}
                      title={`Copy ${c.value}`}
                    >
                      <span className={`${styles.chip} ${c.alpha ? styles.chipAlpha : ""}`}>
                        <span className={styles.chipFill} style={{ background: c.value }} />
                      </span>
                      <span className={styles.swatchMeta}>
                        <span className={styles.swName}>{c.name}</span>
                        <span className={styles.swVar}>{c.varName}</span>
                        <span className={styles.swVal}>
                          {c.value}
                          {copied === c.value && <span className={styles.copiedTag}>Copied!</span>}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
