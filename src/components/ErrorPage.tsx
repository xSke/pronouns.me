import Head from "next/head";
import PronounPresets from "./PronounPresets";

export default function ErrorPage(props: { path: string }): JSX.Element {
  const readablePath = props.path.replace(/^\//, "").split("/").map(decodeURIComponent).join("/");
  return (
    <div className="container">
      <h1>
        <a href="https://youtu.be/dKx1wnXClcI?t=578">Oh no. Pronoun&apos;s busted.</a>
      </h1>

      <p>
        This is a placeholder error page (sorry!). It means I couldn&apos;t find a pronoun matching{" "}
        <code>{readablePath}</code> (from the URL). For best results, try specifying all five pronoun declensions, or
        use the editor on the main page. I&apos;ll make this page prettier soon, promise!
      </p>

      <p>
        For now, try one of these pronoun presets, maybe?
        <PronounPresets />
      </p>

      <Head>
        <title>Unrecognized pronouns | pronouns.me</title>
        <meta property="og:title" content="Unrecognized pronouns"></meta>
      </Head>
    </div>
  );
}
