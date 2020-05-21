import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { Example, examples } from "../examples";
import { allPronouns, PronounSet } from "../pronouns";
import styles from "./FrontPage.module.scss";
import PronounEditor from "./PronounEditor";
import PronounExample from "./PronounExample";
import PronounPresets from "./PronounPresets";

function getPronounsFromUrl(router: NextRouter): PronounSet | undefined {
  const value = decodeURIComponent(router.asPath?.slice(1)); // Starts with /, remove that
  if (value) {
    try {
      return PronounSet.fromUrl(value) ?? undefined;
    } catch (e) {}
  }

  return undefined;
}

function MetaTags(props: { example: Example; pronouns: PronounSet }): JSX.Element {
  // Render various meta tags for social media embeds and a11y
  const userPronounString = props.pronouns.toFullPath(false); // Don't include number
  const exampleString = props.example.renderToString(props.pronouns, "markdown");
  const canonicalUrl = "https://pronouns.me" + (props.pronouns.toUrl() ?? "/");

  return (
    <Fragment>
      {/* Basic HTML tags */}
      <title>Pronoun example: {userPronounString}</title>
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph tags (Twitter, mostly) */}
      <meta property="og:title" content={"Pronoun example: " + userPronounString} />
      <meta property="og:site_name" content="pronouns.me" />
      <meta property="og:description" content={exampleString} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="twitter:card" content="summary" />
      <meta property="og:locale" content="en_US" />

      {/* TODO: oEmbed stuff (not entiiiiirely sure this is needed */}
    </Fragment>
  );
}

export default function FrontPage(): JSX.Element {
  const router = useRouter();

  // If we're coming from the index, use the first pronoun we know of
  const defaultPronouns = router.pathname == "/" ? allPronouns[0] : undefined;
  const [pronouns, setPronouns] = useState<PronounSet | undefined>(defaultPronouns);

  // If the state is empty and the URL has pronoun values, update the state
  const pronounsFromUrl = getPronounsFromUrl(router);
  if (pronouns === undefined && pronounsFromUrl !== undefined) setPronouns(pronounsFromUrl);

  function onPronounsChange(newSet: PronounSet): void {
    console.debug("Change handler: setting new pronoun set: ", newSet.toFullPath());
    // Directly set the state to avoid URL handler round-tripping
    setPronouns(newSet);

    // Then update the URL (if valid, otherwise just ignore)
    const newUrl = newSet.toUrl();
    console.debug("Change handler: setting new URL path: ", newUrl);
    if (newUrl) router.push("/[...pronouns]", newUrl, { shallow: true });
  }

  // Callback runs on init and when the URL changes through the router dependency
  useEffect(() => {
    // Don't do anything if this is the init run
    if (!pronouns) return;

    // Ensure we actually have a change in pronoun sets (to prevent infinite loops)
    const newPronouns = getPronounsFromUrl(router);
    if (newPronouns && !pronouns.equals(newPronouns)) {
      console.debug(
        `Effect handler: updating pronoun set from URL (${pronouns.toFullPath()} -> ${newPronouns.toFullPath()})`
      );
      setPronouns(newPronouns);
    }
  }, [router]);

  // If we don't have a pronoun set, we're likely prerendering a variable URL page.
  // In this case, use a placeholder blank pronoun set so we still get *some* useful content.
  const actualPronouns = pronouns || PronounSet.placeholder;

  const example = examples[0];
  return (
    <Fragment>
      <Head>
        <MetaTags example={example} pronouns={actualPronouns} />
      </Head>

      <div className={"container " + styles.root}>
        <div className={styles.example}>
          <PronounExample key={actualPronouns.toFullPath()} pronouns={actualPronouns} example={example} />
          <PronounPresets />
        </div>

        <div className={styles.editor}>
          <PronounEditor pronouns={actualPronouns} onPronounsChange={onPronounsChange} />
        </div>
      </div>

      <footer className={styles.footer}>
        <a href="https://twitter.com/floofstrid">Author</a>
        <span className="divider" />
        <a href="https://github.com/xSke/pronouns.me">GitHub</a>
      </footer>
    </Fragment>
  );
}
