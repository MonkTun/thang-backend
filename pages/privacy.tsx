import { GetServerSideProps } from "next";

// The canonical Privacy Policy lives at /privacy-policy. This older route is
// kept only so existing links continue to resolve, and redirects there.
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/privacy-policy",
      permanent: true,
    },
  };
};

export default function PrivacyRedirect() {
  return null;
}
