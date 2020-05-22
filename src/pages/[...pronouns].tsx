import { debounce } from "debounce";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { NextRouter, withRouter } from "next/router";
import React, { Fragment } from "react";
import ErrorPage from "../components/ErrorPage";
import PronounPage from "../components/PronounPage";
import { allExamples, Example } from "../examples";
import { PronounSet } from "../pronouns";

function MetaTags(props: { example: Example; pronouns: PronounSet }): JSX.Element {
  // Render various meta tags for social media embeds and a11y
  const userPronounString = props.pronouns.toHumanReadableString({ shorten: false }); // Don't include number
  const exampleString = props.example.renderToString(props.pronouns, "plain"); // TODO: can we get Markdown/HTML support anywhere?
  const canonicalUrl = "https://pronouns.me" + (props.pronouns.toUrl() ?? "/");

  return (
    <Fragment>
      {/* Basic HTML tags */}
      <title>Pronoun example: {userPronounString}</title>
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph tags (Twitter, mostly) */}
      <meta property="og:title" content={"Pronoun example: " + userPronounString} />
      <meta property="og:site_name" content="pronouns.me | Pronoun Preview Helper" />
      <meta property="og:description" content={exampleString} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="en_US" />
      <meta property="twitter:card" content="summary" />

      {/* TODO: oEmbed stuff (not entiiiiirely sure this is needed */}
    </Fragment>
  );
}

type PageProps = { pathFromServer: string };
// type PageProps = {};
type PagePropsWithRouter = PageProps & { router: NextRouter };

type PageState =
  | {
      state: "ready";
      pronouns: PronounSet;
    }
  | { state: "parseError" };

export class MainPronounsPage extends React.Component<PagePropsWithRouter, PageState> {
  constructor(props: PagePropsWithRouter) {
    super(props);

    const path = props.pathFromServer || props.router.asPath;
    const pronouns = PronounSet.fromUrl(path);
    if (pronouns !== null) this.state = { state: "ready", pronouns };
    else this.state = { state: "parseError" };

    // Wrap doUpdateUrl in a debouncer to prevent lag from router updates
    this.doUpdateUrl = debounce(this.doUpdateUrl.bind(this), 250);
  }

  render(): JSX.Element {
    switch (this.state.state) {
      case "parseError":
        return <ErrorPage path={this.props.pathFromServer} />;

      case "ready":
        const example = allExamples[0];
        const pronouns = this.state.pronouns;

        return (
          <Fragment>
            <Head>{!this.props.router.isFallback && <MetaTags example={example} pronouns={pronouns} />}</Head>
            <PronounPage
              example={example}
              pronouns={pronouns}
              onPronounsChange={(np): void => this.onPronounsChange(np)}
            />
          </Fragment>
        );
    }
  }

  onPronounsChange(newSet: PronounSet): void {
    // Update state
    this.setState({ ...this.state, pronouns: newSet });

    // Update URI (going through a debounced function set in ctor)
    this.doUpdateUrl(newSet);
  }

  doUpdateUrl(newSet: PronounSet): void {
    const newUrl = newSet.toUrl();
    if (newUrl) {
      this.props.router.replace("/[...pronouns]", newUrl, { shallow: true });
    }
  }

  componentDidUpdate(prevProps: PagePropsWithRouter): void {
    // If this update changes the router path:
    if (prevProps.router.asPath !== this.props.router.asPath) {
      // Also update the state to the new pronouns
      const pronouns = PronounSet.fromUrl(this.props.router.asPath);

      if (pronouns === null) this.setState({ state: "parseError" });
      else this.setState({ state: "ready", pronouns: pronouns });
    }
  }
}

export default withRouter<PagePropsWithRouter>(MainPronounsPage);

// We add getServerSideProps to force server rendering *including the pronoun path*
// The path gets passed into the page props and *should* always be present.

// This does mean we can't take advantage of Next.js's static rendering, though.
// Although, that's probably okay, I think.

// Using getStaticPaths on the preset pronoun list means we can't properly handle the "obscure pronoun" case properly
// It'll instead render a "fallback page" and side-load getStaticProps with an external request, and that's sorta
// not that cool when we can calculate it based on the URL anyway - the additional request just adds more render latency
// TODO: can we pass props in directly using getStaticPaths some day? If so, do that instead :)
export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const path = "/" + (context.query.pronouns as string[]).map(encodeURIComponent).join("/");
  console.debug(`getServerSideProps: path=${path}, url=${context.req.url}`);
  return { props: { pathFromServer: path } };
};
