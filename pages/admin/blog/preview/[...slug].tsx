import type { GetStaticPaths, GetStaticProps } from "next";
import { PreviewScreen } from "@/components/blog/admin/PreviewScreen";

/**
 * /admin/blog/preview/[...slug] — draft preview of one post. The screen
 * itself is shared with the other collection: components/blog/admin/PreviewScreen.
 *
 * Dev-only, same gate as the editor route: static page, no paths pre-built,
 * and every slug resolves to a 404 in a production build.
 */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps = async () =>
  process.env.NODE_ENV === "development" ? { props: {} } : { notFound: true };

export default function PreviewPostPage() {
  return <PreviewScreen kind="post" />;
}
