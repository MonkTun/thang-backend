"use client";

import type { ButtonProps } from "@/lib/blog/schema";
import { cn } from "@/lib/blog/utils";
import { useEdit } from "@/components/blog/EditContext";
import { OpenLinkIcon } from "@/components/blog/editor/icons";

export function Button({ label, href, variant, align, newTab }: ButtonProps) {
  const ctx = useEdit();

  // align now controls where the label sits *inside* the button, since
  // the button itself fills its placed rect (so resizing the block does
  // what the user expects).
  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  // THANG's `.btn-primary` / `.btn-ghost` (globals.css) re-expressed as
  // utilities so blog CTAs match the marketing site: ember gradient for
  // primary, frosted glass for ghost.
  const variantClass =
    variant === "primary"
      ? "bg-gradient-to-br from-ember-soft to-ember-deep text-ember-ink shadow-ember hover:opacity-95"
      : "border border-border-strong text-frost bg-glass hover:border-ice hover:bg-glass-strong";

  const anchor = (
    <a
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center w-full h-full px-5 py-3 rounded-full transition-all",
        "font-body font-bold text-[15px] tracking-normal normal-case",
        justifyClass,
        variantClass
      )}
    >
      {label}
    </a>
  );

  if (!ctx) return anchor;

  // Editor mode: clicks on the block select it instead of following the
  // link, so surface a floating "open link" chip beside the selected
  // button for testing the target page (always in a new tab so the
  // editor session isn't lost).
  return (
    <span className="relative block h-full w-full">
      {anchor}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Open ${href} in a new tab`}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -right-9 z-20 pointer-events-auto",
            "glass-strong rounded-sm h-7 w-7 flex items-center justify-center",
            "text-foreground/85 hover:text-accent transition-opacity duration-150",
            ctx.selected ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <OpenLinkIcon />
        </a>
      )}
    </span>
  );
}
