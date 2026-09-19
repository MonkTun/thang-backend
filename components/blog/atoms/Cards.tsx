"use client";

import type { CSSProperties, ReactNode } from "react";

import type { CardItem, CardsProps } from "@/lib/blog/schema";
import { useEdit } from "@/components/blog/EditContext";

/**
 * A row of THANG glass cards (`.card` / `.dl-card` in globals.css): icon
 * tile, title, a line of text and an optional status pill — the /download
 * platform cards. `columns` applies from 880px up; below that globals.css
 * stacks `.card-grid` into a single column.
 */
export function Cards({ items, columns, newTab }: CardsProps) {
  const inEditor = useEdit() !== null;

  if (items.length === 0) {
    return (
      <div className="flex h-full min-h-32 w-full items-center justify-center rounded-sm border border-dashed border-border bg-surface/40">
        <span className="kicker text-foreground/30 italic">
          Empty cards — add items in the panel
        </span>
      </div>
    );
  }

  return (
    <div
      className="card-grid"
      style={{ "--card-cols": columns } as CSSProperties}
    >
      {items.map((item, i) => (
        <CardShell
          key={i}
          item={item}
          index={i}
          newTab={newTab}
          // In the editor a click selects the block instead of following it.
          linked={!inEditor}
        >
          {item.icon && (
            <span className="dl-card__icon" aria-hidden>
              {item.icon}
            </span>
          )}
          <div>
            <h3 className="card__title">{item.title}</h3>
            {item.text && <p className="card__text">{item.text}</p>}
          </div>
          {item.status && <span className="dl-status">{item.status}</span>}
        </CardShell>
      ))}
    </div>
  );
}

function CardShell({
  item,
  index,
  newTab,
  linked,
  children,
}: {
  item: CardItem;
  index: number;
  newTab: boolean;
  linked: boolean;
  children: ReactNode;
}) {
  const className = `card dl-card reveal d${(index % 4) + 1}`;
  if (item.href && linked) {
    return (
      <a
        href={item.href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        className={className}
        style={{ textDecoration: "none" }}
      >
        {children}
      </a>
    );
  }
  return <article className={className}>{children}</article>;
}
