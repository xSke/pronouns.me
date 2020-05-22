import * as uuid from "uuid";
import { Declension, PronounSet } from "./pronouns";
import { applyCasing, Casing, getCasing } from "./utils";

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

/** Represents a full example object, currently just a list of nodes and an ID. */
export class Example {
  public readonly id: string;

  constructor(public nodes: Array<NodeInstance>) {
    this.id = uuid.v4();
  }

  /**
   * Parses a pronoun example in string form into an {@link Example} object.
   *
   * - Normal text will be parsed as-is, into a {@link TextNode} object.
   * - Pronoun declensions go in `{curly braces}`, and may correspond to anything in the {@link declensionTagNames} map. The matching is case-insensitive, but if the declension given in the input starts with an uppercase letter, the resulting pronoun node will keep that casing.
   * - Number-sensitive verbs follow the format `[singular/plural]`, eg. `[has/have]` or `[does/do]`.
   */
  static parse(input: string): Example {
    const nodes: NodeInstance[] = [];

    // Regexes specifically only match at the start
    const textRegex = /^[^{[]+/; // Matches everything until a tag start
    const pronounRegex = /^{([\w-]+)}/; // Matches a {Pronoun} tag
    const numberRegex = /^\[([\w']+)\/([\w']+)\]/; // Matches a [singular/plural] tag

    // We repeatedly try to match a regex until there's no more text left
    while (input) {
      let match: RegExpExecArray | null;
      if ((match = textRegex.exec(input))) {
        // Text node, copy verbatim
        nodes.push({ id: uuid.v4(), type: "text", text: match[0] });
      } else if ((match = pronounRegex.exec(input))) {
        // This is a {pronoun} tag
        const inner = match[1];
        // Match tag case-insensitively
        // *then* extract intended casing from what was actually given ({subject} = lower, {Subject} = upper, etc)
        const declension = declensionTagNames[inner.toLowerCase()];
        const casing = getCasing(inner);
        if (declension === undefined) throw new Error(`Unknown pronoun declension '${inner}'.`);
        nodes.push({ id: uuid.v4(), type: "pronoun", declension, casing });
      } else if ((match = numberRegex.exec(input))) {
        // This is a [singular/plural] tag
        nodes.push({ id: uuid.v4(), type: "number", singular: match[1], plural: match[2] });
      } else break; // should never happen

      // "advance" the input, will hit the while exit case if we're now done
      input = input.slice(match[0].length);
    }

    return new Example(nodes);
  }

  renderToString(pronouns: PronounSet, formatting: "plain" | "markdown" | "html"): string {
    let output = "";
    for (const node of this.nodes) {
      switch (node.type) {
        case "text":
          output += node.text;
          break;
        case "pronoun":
          const pronoun = applyCasing(pronouns.get(node.declension), node.casing);

          // Embolden the pronoun if we can
          if (formatting == "markdown") output += `**${pronoun}**`;
          else if (formatting == "html") output += `<strong>${pronoun}</strong>`;
          else output += pronoun;
          break;
        case "number":
          output += pronouns.number == "singular" ? node.singular : node.plural;
          break;
      }
    }

    return output;
  }
}

/**
 * A list of examples to display on the main page.
 */
export const allExamples: Array<Example> = [
  // Based on "Generic Text" from the Pronoun Dressing Room (pronouns.failedslacker.com), originally by @underneathbubbles @ tumblr.com
  // TODO: add a way to credit text authors on the site
  "Hello! Today I met a new friend, and {s} [is/are] really nice. {S} [has/have] a wonderful personality. That smile of {pp} really makes me happy. I could talk to {o} all day, although {s} [doesn't/don't] talk about {r} much. I wonder if {pd} day has been wonderful. I hope so!",
].map((e) => Example.parse(e));
