import Link from "next/link";
import { useState } from "react";
import { allPronouns, toTemplate } from "../models/pronouns";
import styles from "./PronounPresets.module.scss";

// Just he/she/they for now
const commonPronouns = [allPronouns[0], allPronouns[1], allPronouns[2]];

export default function PronounPresets(): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const pronounsToDisplay = expanded ? allPronouns.filter((p) => p.preferred) : commonPronouns;

  function doExpand(e: React.MouseEvent<HTMLAnchorElement>): void {
    setExpanded(true);
    e.preventDefault();
  }

  return (
    <div className={styles.presets}>
      <h3>Or try one of these pronoun presets:</h3>
      <ul>
        {pronounsToDisplay.map((p) => {
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

        {!expanded ? (
          <li style={{ fontStyle: "italic" }}>
            <a href="#" onClick={doExpand}>
              (show more...)
            </a>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
