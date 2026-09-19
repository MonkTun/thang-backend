import type { GetServerSideProps } from "next";

import { SITE_URL } from "@/lib/blog/site";

/**
 * /robots.txt — crawl the public site, keep the admin, the API and the
 * signed-in account pages out of the index, and point at the sitemap.
 */

const DISALLOW = [
  "/admin/",
  "/api/",
  "/profile",
  "/social",
  "/login",
  "/invite",
  "/verify",
];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const body = [
    "User-agent: *",
    "Allow: /",
    ...DISALLOW.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.write(body);
  res.end();

  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
