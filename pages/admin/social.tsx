import Head from "next/head";
import { SocialPage } from "../social";

export default function AdminSocialPage() {
  return (
    <>
      <Head>
        <title>Admin Party & Matchmaking | Thang</title>
      </Head>
      <SocialPage adminMode />
    </>
  );
}
