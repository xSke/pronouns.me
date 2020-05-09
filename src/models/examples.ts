import * as uuid from "uuid";
import { isCapitalized } from "../utils";
import { Declension } from "./pronouns";

export type Casing = "lower" | "upper";

export interface TextNode {
  type: "text";
  text: string;
}

export interface PronounNode {
  type: "pronoun";
  declension: Declension;
  casing: Casing;
}

export interface PronounComponent {
  type: "number";
  singular: string;
  plural: string;
}

export type NodeValue = TextNode | PronounNode | PronounComponent;

export type NodeInstance = {
  id: string;
} & NodeValue;

const declensionNames: Partial<Record<string, Declension>> = {
  // The basic names
  subject: "subject",
  object: "object",
  "possessive-determiner": "possessive-determiner",
  "possessive-pronoun": "possessive-pronoun",
  reflexive: "reflexive",

  // Shortened
  s: "subject",
  o: "object",
  pd: "possessive-determiner",
  pp: "possessive-pronoun",
  r: "reflexive",

  // By example (they/them has unique values for all types)
  they: "subject",
  them: "object",
  their: "possessive-determiner",
  theirs: "possessive-pronoun",
  themself: "reflexive", // Both are valid
  themselves: "reflexive",
};

export interface Example {
  id: string;
  nodes: Array<NodeInstance>;
}

export function parse(format: string): Example {
  const nodes: NodeInstance[] = [];
  for (const word of format.split(" ")) {
    const pronounTagMatch = /{(\w+)}/.exec(word); // ex: {subject}
    const numberTagMatch = /\[([\w\-']+)[/\|]([\w\-']+)\]/.exec(word); // eg: [has|have]
    if (pronounTagMatch) {
      // This is a {pronoun} tag
      const inner = pronounTagMatch[1];

      // Match tag case-insensitively
      // *then* extract intended casing from what was actually given ({subject} = lower, {Subject} = upper, etc)
      const declension = declensionNames[inner.toLowerCase()];
      const casing = isCapitalized(inner) ? "upper" : "lower";
      if (declension === undefined) throw new Error(`Unknown pronoun declension '${inner}'.`);
      nodes.push({ id: uuid.v4(), type: "pronoun", declension, casing });
    } else if (numberTagMatch) {
      // This is a [singular|plural] tag
      const singular = numberTagMatch[1];
      const plural = numberTagMatch[2];
      nodes.push({ id: uuid.v4(), type: "number", singular, plural });
    } else {
      // This is a plain word
      const lastNode = nodes[nodes.length - 1];
      if (lastNode !== undefined && lastNode.type == "text") {
        // Last node was also a text node, we just append this word to that
        lastNode.text += " " + word;
      } else {
        // Add a new text node
        nodes.push({ id: uuid.v4(), type: "text", text: word });
      }
    }
  }

  return { id: uuid.v4(), nodes: nodes };
}
