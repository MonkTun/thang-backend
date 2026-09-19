import type { GetStaticPaths, GetStaticProps } from "next";
import { EditorScreen } from "@/components/blog/admin/EditorScreen";

/**
 * /admin/pages/edit/[...slug] — the block editor for one site page. The screen
 * itself is shared with the other collection: components/blog/admin/EditorScreen.
 *
 * Dev-only: the editor exists only under `next dev`. A production build
 * turns this page into a 404 (the portfolio's proxy behaviour) — the page
 * stays static, no getServerSideProps. Next requires getStaticPaths on a
 * dynamic SSG route: no paths are pre-built, and "blocking" lets dev render
 * any slug on demand while production resolves every slug to the 404.
 */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps = async () =>
  process.env.NODE_ENV === "development" ? { props: {} } : { notFound: true };

export default function EditSitePagePage() {
  return <EditorScreen kind="page" />;
}
