import { AppProps } from "next/app";
import { Router } from "next/router";
import { useEffect } from "react";
import "../style/main.scss";
import { GA_TRACKING_ID } from "../utils";

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  // https://github.com/zeit/next.js/tree/canary/examples/with-google-analytics
  useEffect(() => {
    const handleRouteChange = (url: string): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/camelcase
      (window as any)["gtag"]("config", GA_TRACKING_ID, { page_path: url });
    };

    Router.events.on("routeChangeComplete", handleRouteChange);
    return (): void => {
      Router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return <Component {...pageProps} />;
}
