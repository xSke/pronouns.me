import {
  NodeInstance,
  PronounNode as PronounNodeValue,
} from "../models/examples";
import { PronounSet } from "../models/pronouns";
import { capitalize } from "../utils";
import styles from "./pronoun-node.module.scss";

interface PronounNodeProps {
  node: NodeInstance & PronounNodeValue;
  set: PronounSet;
}

export default function PronounNode({
  node,
  set,
}: PronounNodeProps): JSX.Element {
  let value = set.get(node.declension);
  if (node.capitalize) value = capitalize(value);

  // Pronoun nodes are spans, with a class that color-codes them by declension
  return (
    <span key={node.id} className={styles[node.declension]}>
      {value}
    </span>
  );
}
