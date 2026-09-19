"use client";

import { useState } from "react";

import type { SwatchesProps } from "@/lib/blog/schema";
import { useEdit } from "@/components/blog/EditContext";
import styles from "@/styles/brand.module.css";

/**
 * Brand guide — a titled group of color swatches. Clicking one copies its
 * value (not in the editor, where a click selects the block). Translucent
 * colors are drawn over a checkerboard so the alpha reads.
 */
export function Swatches({ title, colors }: SwatchesProps) {
  const inEditor = useEdit() !== null;
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (value: string) => {
    if (inEditor) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopied(value);
    window.setTimeout(() => setCopied((c) => (c === value ? null : c)), 1200);
  };

  return (
    <div className={styles.group}>
      {title && <h3 className={styles.groupTitle}>{title}</h3>}
      <div className={styles.swatchGrid}>
        {colors.map((c, i) => (
          <button
            key={`${c.varName}-${i}`}
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
  );
}
