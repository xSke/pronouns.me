import { Fragment } from "react";
import { Example } from "../examples";
import { PronounSet } from "../pronouns";
import PronounEditor from "./PronounEditor";
import PronounExample from "./PronounExample";
import styles from "./PronounPage.module.scss";
import PronounPresets from "./PronounPresets";

export type Props = {
  pronouns: PronounSet;
  example: Example;
  onPronounsChange: (newSet: PronounSet) => void;
};

export default function PronounPage({ pronouns, example, onPronounsChange }: Props): JSX.Element {
  return (
    <Fragment>
      <div className="container">
        <main className={styles.root}>
          <div className={styles.example}>
            <PronounExample key={pronouns.toCanonical()} pronouns={pronouns} example={example} />

            <div className={styles.presets}>
              <h3>Or pick one of these pronoun presets:</h3>
              <PronounPresets />
            </div>
          </div>

          <div className={styles.editor}>
            <PronounEditor pronouns={pronouns} onPronounsChange={onPronounsChange} />
          </div>
        </main>
      </div>
    </Fragment>
  );
}
