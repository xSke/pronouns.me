import Document, { Head, Html, Main, NextScript } from "next/document";
import { GA_TRACKING_ID } from "../utils";

const gaScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_TRACKING_ID}', {page_path: window.location.pathname});
`.replace(/\n/g, "");

export default class CustomDocument extends Document {
  render(): JSX.Element {
    const title = "pronouns.me | Pronoun Preview Helper";
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}></script>
          <script dangerouslySetInnerHTML={{ __html: gaScript }}></script>

          <meta property="og:title" content={title} />
          <meta property="og:site_name" content={title} />
          <meta property="og:locale" content="en_US" />
          <meta property="twitter:card" content="summary" />

          <link
            href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
