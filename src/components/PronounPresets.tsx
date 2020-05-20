import Link from "next/link";
import { useState } from "react";
import { allPronouns, shortestPathLength } from "../pronouns";
import styles from "./PronounPresets.module.scss";

// Just he/she/they for now
const commonPronouns = [allPronouns[0], allPronouns[1], allPronouns[2]];

export default function PronounPresets(): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const pronounsToDisplay = expanded ? allPronouns : commonPronouns;

  function doExpand(e: React.MouseEvent<HTMLAnchorElement>): void {
    setExpanded(true);
    e.preventDefault();
  }

  return (
    <div className={styles.presets}>
      <h3>Or pick one of these pronoun presets:</h3>
      <ul>
        {pronounsToDisplay.map((p) => {
          const { length, needNumberTag } = shortestPathLength(p);

          const shortPath = p.toDeclensionList().slice(0, length).join("/");
          const fullPath = p.toDeclensionList().join("/") + (needNumberTag ? "/" + p.number : "");

          return (
            <li key={p.toFullPath()}>
              <Link href="/[...pronouns]" as={p.toUrl() ?? ""}>
                <a>
                  <b>{shortPath}</b>
                  {fullPath.slice(shortPath.length)}
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
