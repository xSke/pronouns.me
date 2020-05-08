import { AppProps } from "next/app";
import "../style/main.scss";

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return <Component {...pageProps} />;
}
