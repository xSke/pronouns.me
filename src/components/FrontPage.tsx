import { NextRouter, useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import examples from "../data/examples";
import { allPronouns, arePronounSetsEqual, parse as parsePronouns, PronounSet, toTemplate } from "../models/pronouns";
import styles from "./FrontPage.module.scss";
import PronounEditor from "./PronounEditor";
import PronounExample from "./PronounExample";
import PronounPresets from "./PronounPresets";

function getPronounsFromUrl(router: NextRouter): PronounSet | undefined {
  const value = decodeURIComponent(router.asPath?.slice(1)); // Starts with /, remove that
  if (value) {
    try {
      return parsePronouns(value, true);
    } catch (e) {}
  }

  return undefined;
}

export default function FrontPage(): JSX.Element {
  const router = useRouter();

  // If we're coming from the index, use the first pronoun we know of
  const defaultPronouns = router.pathname == "/" ? allPronouns[0] : undefined;
  const [pronouns, setPronouns] = useState<PronounSet | undefined>(defaultPronouns);

  const pronounsFromUrl = getPronounsFromUrl(router);
  // If the state is empty and the URL has pronoun values, update the state
  if (pronouns === undefined && pronounsFromUrl !== undefined) setPronouns(pronounsFromUrl);

  function onPronounsChange(ps: PronounSet): void {
    // Update the URL to correspond with the new pronoun sets
    // This will in turn hit the useEffect block below, which updates state and then rerenders page
    const path = toTemplate(ps, { shorten: true });
    router.push("/[...pronouns]", "/" + path, { shallow: true });
  }

  // Callback runs on init and when the URL changes through the router dependency
  useEffect(() => {
    // Don't do anything if this is the init run
    if (!pronouns) return;

    // Ensure we actually have a change in pronoun sets (to prevent infinite loops)
    const newPronouns = getPronounsFromUrl(router);
    if (newPronouns && !arePronounSetsEqual(pronouns, newPronouns)) {
      setPronouns(newPronouns);
    }
  }, [router]);

  // If we haven't found the correct pronoun set, we're probably still waiting for the query update
  // Just return a blank div until next rerender
  if (pronouns === undefined) return <div></div>;

  const example = examples[0];
  return (
    <Fragment>
      <div className={"container " + styles.root}>
        <div className={styles.example}>
          <PronounExample key={toTemplate(pronouns)} pronouns={pronouns} example={example} />
          <PronounPresets />
        </div>

        <div className={styles.editor}>
          <PronounEditor pronouns={pronouns} onPronounsChange={onPronounsChange} />
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
