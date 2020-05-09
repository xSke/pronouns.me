import { Casing } from "../models/examples";
import { Declension, declensionNames, PronounSet } from "../models/pronouns";
import { capitalize } from "../utils";

interface PronounNodeProps {
  pronouns: PronounSet;
  declension: Declension;
  casing: Casing;
  tooltipLocation?: "top" | "bottom";
}

function applyCasing(s: string, casing: Casing): string {
  switch (casing) {
    case "lower":
      return s.toLowerCase();
    case "upper":
      return capitalize(s);
  }
}

export default function PronounNode({ pronouns, declension, casing, tooltipLocation }: PronounNodeProps): JSX.Element {
  const value = applyCasing(pronouns.declensions[declension], casing);
  const name = declensionNames[declension];

  // Pronoun nodes are spans, with a class that color-codes them by declension
  return (
    <span data-tooltip={name} className={`tooltip-${tooltipLocation ?? "top"} pronoun-${declension}`}>
      {value}
    </span>
  );
}