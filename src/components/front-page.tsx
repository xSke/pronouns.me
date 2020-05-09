import { NextRouter, useRouter } from "next/router";
import { useEffect, useState } from "react";
import PronounEditor from "../components/pronoun-editor";
import PronounExample from "../components/pronoun-example";
import examples from "../data/examples";
import { allPronouns } from "../data/pronouns";
import { parse as parsePronouns, PronounSet, setsEqual, toTemplate } from "../models/pronouns";
import styles from "./front-page.module.scss";
import PronounPresets from "./pronoun-presets";

function getPronounsFromUrl(router: NextRouter): PronounSet | undefined {
  const value = router.asPath?.slice(1); // Starts with /, remove that
  if (value) {
    try {
      return parsePronouns(value, true);
    } catch (e) {}
  }

  return undefined;
}

export default function FrontPage(): JSX.Element {
  const router = useRouter();
  const defaultPronouns = router.pathname == "/" ? allPronouns[0] : undefined;
  const [pronouns, setPronouns] = useState<PronounSet | undefined>(defaultPronouns);

  const pronounsFromUrl = getPronounsFromUrl(router);
  if (pronouns === undefined && pronounsFromUrl !== undefined) setPronouns(pronounsFromUrl);

  function onPronounsChange(ps: PronounSet): void {
    setPronouns(ps);

    const path = toTemplate(ps, { shorten: true });
    router.push("/[...pronouns]", "/" + path, { shallow: true });
  }

  useEffect(() => {
    const newPronouns = getPronounsFromUrl(router);
    if (pronouns && newPronouns && !setsEqual(pronouns, newPronouns)) {
      setPronouns(newPronouns);
    }
  }, [router]);

  // If we haven't found the correct pronoun set, we're probably still waiting for the query update
  // Just return a blank div until next rerender
  if (pronouns === undefined) return <div></div>;

  const example = examples[0];
  return (
    <div className={"container " + styles.root}>
      <div className={styles.example}>
        <PronounExample key={toTemplate(pronouns)} pronouns={pronouns} example={example} />
      </div>

      <div className={styles.editor}>
        <PronounEditor pronouns={pronouns} onPronounsChange={onPronounsChange} />
        <PronounPresets />
      </div>
    </div>
  );
}
