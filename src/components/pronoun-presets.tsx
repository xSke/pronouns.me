import Link from "next/link";
import { allPronouns } from "../data/pronouns";
import { toTemplate } from "../models/pronouns";
import styles from "./pronoun-presets.module.scss";

export default function PronounPresets(): JSX.Element {
  return (
    <div className={styles.presets}>
      <h3>Or try one of these pronoun presets:</h3>
      <ul>
        {allPronouns.map((p) => {
          const shortenedPath = toTemplate(p, { shorten: true });
          const path = toTemplate(p, { includeNumber: false });
          return (
            <li key={shortenedPath}>
              <Link href="/[...pronouns]" as={"/" + shortenedPath}>
                <a>
                  <b>{shortenedPath}</b>
                  {path.slice(shortenedPath.length)}
                </a>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
