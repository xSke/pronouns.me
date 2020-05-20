import * as uuid from "uuid";
import { Declension } from "./pronouns";
import { isCapitalized } from "./utils";

/** Whether to capitalize a given use of a pronoun. "lower" means all-lowercase, "upper" means First Letter Capitalized. */
export type Casing = "lower" | "upper";

/** Represents plain text, passed through verbatim. */
export type TextNode = { type: "text"; text: string };

/** Represents a given pronoun declension along with a casing. Will be replaced by the corresponding value from the given pronoun set at runtime. */
export type PronounNode = { type: "pronoun"; declension: Declension; casing: Casing };

/** Represents a word (usually a verb) that depends on the pronoun set's number. Will be replaced by either the singular or plural value depending on the pronoun set given. */
export type NumberedWordNode = { type: "number"; singular: string; plural: string };

/** Represents a node of any of the available types. */
export type NodeValue = TextNode | PronounNode | NumberedWordNode;

/** Represents a node also containing a random unique ID (eg. for React node keys) */
export type NodeInstance = NodeValue & { id: string };

/** Represents a full example object, currently just a list of nodes and an ID. */
export type Example = { id: string; nodes: Array<NodeInstance> };

const declensionTagNames: Partial<Record<string, Declension>> = {
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

/**
 * Parses a pronoun example in string form into an {@link Example} object.
 *
 * - Normal text will be parsed as-is, into a {@link TextNode} object.
 * - Pronoun declensions go in `{curly braces}`, and may correspond to anything in the {@link declensionTagNames} map. The matching is case-insensitive, but if the declension given in the input starts with an uppercase letter, the resulting pronoun node will keep that casing.
 * - Number-sensitive verbs follow the format `[singular/plural]`, eg. `[has/have]` or `[does/do]`.
 */
export function parseExample(format: string): Example {
  const nodes: NodeInstance[] = [];
  for (const word of format.split(" ")) {
    const pronounTagMatch = /{(\w+)}/.exec(word); // ex: {subject}
    const numberTagMatch = /\[([\w\-']+)[/\|]([\w\-']+)\]/.exec(word); // eg: [has/have]
    if (pronounTagMatch) {
      // This is a {pronoun} tag
      const inner = pronounTagMatch[1];

      // Match tag case-insensitively
      // *then* extract intended casing from what was actually given ({subject} = lower, {Subject} = upper, etc)
      const declension = declensionTagNames[inner.toLowerCase()];
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

/**
 * A list of examples to display on the main page.
 */
export const examples = [
  // Based on "Generic Text" from the Pronoun Dressing Room (pronouns.failedslacker.com), originally by @underneathbubbles @ tumblr.com
  // TODO: add a way to credit text authors on the site
  "Hello! Today I met a new friend, and {s} [is/are] really nice. {S} [has/have] a wonderful personality. That smile of {pp} really makes me happy. I could talk to {o} all day, although {s} [doesn't/don't] talk about {r} much. I wonder if {pd} day has been wonderful. I hope so!",
].map(parseExample);
