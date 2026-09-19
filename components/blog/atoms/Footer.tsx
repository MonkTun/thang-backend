"use client";

import type { FooterProps } from "@/lib/blog/schema";
import FooterNav from "@/components/FooterNav";
import { useEdit } from "@/components/blog/EditContext";

/**
 * The site footer as a block. Keep it in a mirror (it ships as "Site
 * footer") so every page shares one: edit the links once, all pages follow.
 * Give the block a full bleed and its section no padding to run it edge to
 * edge like the coded footer did.
 */
export function Footer({ brand, links, legal }: FooterProps) {
  const inEditor = useEdit() !== null;
  return (
    <div style={inEditor ? { pointerEvents: "none" } : undefined}>
      <FooterNav brand={brand} links={links} legal={legal} flush />
    </div>
  );
}
