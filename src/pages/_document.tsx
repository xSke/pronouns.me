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
    return (
      <Html lang="en" dir="ltr">
        <Head>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}></script>
          <script dangerouslySetInnerHTML={{ __html: gaScript }}></script>

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
