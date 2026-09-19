import type { AppProps } from "next/app";
import Head from "next/head";
import { Grandstander, Nunito } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/blog.css";

// Brand type — used across the site (and the matching static .ttf weights ship
// with the UE5 client + merch). Both are OFL-licensed, so they're free to embed.
const grandstander = Grandstander({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-grandstander",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/ThangLogo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#05070e" />
        <title>Thang</title>
      </Head>
      {/* next/font binds the per-font variables on <main> via .variable
          classes below. The blog editor renders popovers into a body
          portal (outside <main>), so the same variables are also declared
          on :root here — otherwise portal chrome falls back to system-ui. */}
      <style jsx global>{`
        :root {
          --font-grandstander: ${grandstander.style.fontFamily};
          --font-nunito: ${nunito.style.fontFamily};
        }
      `}</style>
      <main className={`app-main ${grandstander.variable} ${nunito.variable}`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
