import type { AppProps } from "next/app";
import Head from "next/head";
import NavBar from "@/components/NavBar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/ThangLogo.png" />
        <title>Thang</title>
      </Head>
      <style jsx global>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html,
        body,
        #__next {
          min-height: 100%;
          margin: 0;
          background: #0b0d10;
          color: #e7e9ed;
        }

        body {
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }

        :focus-visible {
          outline: none;
          box-shadow: none;
        }

        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible {
          outline: none;
          box-shadow: 0 0 0 1px #1e232d;
        }
      `}</style>
      <NavBar />
      <main style={{ paddingTop: "72px" }}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
