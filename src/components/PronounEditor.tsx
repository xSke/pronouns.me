import { Declension, declensionNames, declensionsList, PronounNumber, PronounSet } from "../pronouns";
import styles from "./PronounEditor.module.scss";

interface Props {
  pronouns: PronounSet;
  onPronounsChange?: (newPronouns: PronounSet) => void;
}

type RowProps = {
  declension: Declension;
} & Props;

const examples: Record<Declension, string> = {
  subject: '<b class="pronoun-subject">He</b> is nice.',
  object: 'I like <b class="pronoun-object">him</b>.',
  "possessive-determiner": '<b class="pronoun-possessive-determiner">Their</b> socks are grey.',
  "possessive-pronoun": 'The ball is <b class="pronoun-possessive-pronoun">hers</b>.',
  reflexive: 'She did it <b class="pronoun-reflexive">herself</b>.',
};

function PronounDeclensionRow({ pronouns, declension: thisDeclension, onPronounsChange }: RowProps): JSX.Element {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const newValue = e.target.value;

    const newDeclensions = { ...pronouns.declensions };
    newDeclensions[thisDeclension] = newValue;

    const newSet = new PronounSet(newDeclensions, pronouns.number);
    if (onPronounsChange) onPronounsChange(newSet);
  }

  const name = declensionNames[thisDeclension];
  return (
    <div className={styles.row}>
      <div className={styles.title}>
        <label htmlFor={thisDeclension}>{name}</label>
        <span className={styles["pronoun-help"]}>
          (eg. &ldquo;<span dangerouslySetInnerHTML={{ __html: examples[thisDeclension] }}></span>&rdquo;)
        </span>
      </div>
      <input
        id={thisDeclension}
        type="text"
        placeholder="pronoun goes here..."
        maxLength={15} // Is this a reasonable value?
        value={pronouns.declensions[thisDeclension]}
        onChange={handleChange}
      ></input>
    </div>
  );
}

function NumberRow(props: Props): JSX.Element {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    if (props.onPronounsChange) {
      const newNumber = e.target.value as PronounNumber;
      props.onPronounsChange(props.pronouns.withNumber(newNumber));
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.title}>
        <label htmlFor="pronounNumber">Conjugate verbs as...</label>
        {props.pronouns.number == "singular" ? (
          <span className={styles["pronoun-help"]}>
            (eg. &ldquo;he <b className={styles.number}>is</b> clever&rdquo;)
          </span>
        ) : (
          <span className={styles["pronoun-help"]}>
            (eg. &ldquo;they <b className={styles.number}>are</b> clever&rdquo;)
          </span>
        )}
      </div>
      <select id="pronounNumber" onChange={handleChange} value={props.pronouns.number}>
        <option value="singular">Singular</option>
        <option value="plural">Plural</option>
      </select>
    </div>
  );
}

function URLHint(props: { pronouns: PronounSet }): JSX.Element {
  const path = props.pronouns.toUrl();

  // Bail if invalid URL
  if (!path) return <div className={styles.url}></div>;

  const url = "https://pronouns.me" + path;
  return (
    <div className={styles.url}>
      <div>Share this pronoun set with the link below:</div>
      <a href={url}>{url}</a>
    </div>
  );
}

export default function PronounEditor(props: Props): JSX.Element {
  return (
    <div className={styles.editor}>
      <h2>Try it yourself!</h2>

      {declensionsList.map((d) => (
        <PronounDeclensionRow key={d} declension={d} {...props} />
      ))}

      <NumberRow {...props} />

      <URLHint pronouns={props.pronouns} />
    </div>
  );
}
