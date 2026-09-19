"use client";

import type { FontSpecimenProps } from "@/lib/blog/schema";
import styles from "@/styles/brand.module.css";

/**
 * Brand guide — one typeface panel: name + role, a sample line, then the
 * same line once per weight. Styles are the /brand page's
 * (styles/brand.module.css), which read the global tokens so the guide
 * always mirrors the real product.
 */
export function FontSpecimen({
  family,
  name,
  role,
  sample,
  ladderText,
  weights,
}: FontSpecimenProps) {
  const display = family === "display";
  return (
    // Fill the block so two specimens side by side end level.
    <div className={styles.typePanel} style={{ height: "100%" }}>
      <div className={styles.typeHead}>
        <h3 className={styles.typeName}>{name}</h3>
        {role && <span className={styles.typeRole}>{role}</span>}
      </div>
      {sample && (
        <p className={display ? styles.typeSample : styles.bodySample}>{sample}</p>
      )}
      {weights.map((w) => (
        <div key={w} className={styles.ladderItem}>
          <span
            style={{
              fontFamily: display ? "var(--font-display)" : "var(--font-body)",
              fontWeight: w,
              fontSize: display ? 26 : 20,
              color: "var(--frost)",
            }}
          >
            {ladderText}
          </span>
          <span className={styles.ladderLabel}>{w}</span>
        </div>
      ))}
    </div>
  );
}
