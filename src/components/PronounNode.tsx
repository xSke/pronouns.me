import { Declension, PronounSet } from "../pronouns";
import { applyCasing, Casing } from "../utils";

interface PronounNodeProps {
  pronouns: PronounSet;
  declension: Declension;
  casing: Casing;
}

export default function PronounNode({ pronouns, declension, casing }: PronounNodeProps): JSX.Element {
  const value = applyCasing(pronouns.declensions[declension], casing).trim();

  // Pronoun nodes are spans, with a class that color-codes them by declension
  return <span className={`pronoun-${declension}`}>{value}</span>;
}
