import { Casing } from "../examples";
import { Declension, PronounSet } from "../pronouns";
import { capitalize } from "../utils";

interface PronounNodeProps {
  pronouns: PronounSet;
  declension: Declension;
  casing: Casing;
}

function applyCasing(s: string, casing: Casing): string {
  switch (casing) {
    case "lower":
      return s.toLowerCase();
    case "upper":
      return capitalize(s);
  }
}

export default function PronounNode({ pronouns, declension, casing }: PronounNodeProps): JSX.Element {
  const value = applyCasing(pronouns.declensions[declension], casing);

  // Pronoun nodes are spans, with a class that color-codes them by declension
  return <span className={`pronoun-${declension}`}>{value}</span>;
}
