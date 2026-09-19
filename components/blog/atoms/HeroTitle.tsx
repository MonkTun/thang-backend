"use client";

import type { CSSProperties } from "react";

import type { HeroTitleProps } from "@/lib/blog/schema";

/**
 * The home hero's animated wordmark: every letter drops in with a springy
 * overshoot, bobs slowly, and hops once when hovered. All of the motion and
 * the icy gradient live in globals.css (`.hero__title`, `.hero__letter`);
 * this only splits the text into letters. Screen readers get the whole word
 * through `aria-label` instead of six separate spans.
 */
export function HeroTitle({ text, as, align }: HeroTitleProps) {
  const Tag = as;
  return (
    <Tag className="hero__title" aria-label={text} style={{ textAlign: align }}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className="hero__letter"
          style={{ "--i": i } as CSSProperties}
          aria-hidden="true"
        >
          <span
            className="hero__letter-inner"
            onMouseEnter={(e) => e.currentTarget.classList.add("is-hop")}
            onAnimationEnd={(e) => {
              if (e.animationName === "letterHop") {
                e.currentTarget.classList.remove("is-hop");
              }
            }}
          >
            {/* A bare space collapses inside inline-block. */}
            {ch === " " ? " " : ch}
          </span>
        </span>
      ))}
    </Tag>
  );
}
