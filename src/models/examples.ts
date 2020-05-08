import { v4 as uuidv4 } from "uuid";
import { isCapitalized } from "../utils";
import { PronounDeclension } from "./pronouns";

export interface TextNode {
  type: "text";
  text: string;
}

export interface PronounNode {
  type: "pronoun";
  declension: PronounDeclension;
}

export interface PronounComponent {
  type: "number";
  singular: string;
  plural: string;
}

export type NodeValue = TextNode | PronounNode | PronounComponent;

export type NodeInstance = {
  id: string;
  capitalize: boolean;
} & NodeValue;

const componentTags: Record<string, NodeValue> = {
  sub: { type: "pronoun", declension: "subject" },
  obj: { type: "pronoun", declension: "object" },
  pd: { type: "pronoun", declension: "possessive-determiner" },
  pp: { type: "pronoun", declension: "possessive-pronoun" },
  ref: { type: "pronoun", declension: "reflexive" },

  // they/them pronouns are unique across all forms (so are "we" and "I")
  they: { type: "pronoun", declension: "subject" },
  them: { type: "pronoun", declension: "object" },
  their: { type: "pronoun", declension: "possessive-determiner" },
  theirs: { type: "pronoun", declension: "possessive-pronoun" },
  themselves: { type: "pronoun", declension: "reflexive" },
  themself: { type: "pronoun", declension: "reflexive" },

  // Plural-dependent words (need to add more?)
  is: { type: "number", singular: "is", plural: "are" },
  are: { type: "number", singular: "is", plural: "are" },
  was: { type: "number", singular: "was", plural: "were" },
  were: { type: "number", singular: "was", plural: "were" },
  have: { type: "number", singular: "has", plural: "have" },
  has: { type: "number", singular: "has", plural: "have" },
  "doesn't": { type: "number", singular: "doesn't", plural: "don't" },
};

export class Example {
  public id: string;

  constructor(readonly nodes: NodeInstance[]) {
    this.id = uuidv4();
  }

  static parse(format: string): Example {
    // format: {Sub} is very {obj}, etc etc.
    const regex = /{([\w']+)}/g; // search for {tags}

    const nodes: NodeInstance[] = [];
    let match,
      lastPosition = 0;
    while ((match = regex.exec(format)) !== null) {
      // Add leading text ndoe
      if (match.index > 0) {
        const textSegment = format.slice(lastPosition, match.index);
        nodes.push({
          id: uuidv4(),
          type: "text",
          text: textSegment,
          capitalize: false,
        });
      }

      // Add node by tag
      const tag = match[1];
      const component = componentTags[tag.toLowerCase()];
      if (!component) throw new Error(`Unknown tag '${tag}'.`);

      nodes.push({
        id: uuidv4(),
        capitalize: isCapitalized(tag),
        ...component,
      });

      lastPosition = match.index + match[0].length;
    }

    // Add trailing text node
    if (lastPosition < format.length) {
      nodes.push({
        id: uuidv4(),
        type: "text",
        text: format.slice(lastPosition),
        capitalize: false,
      });
    }

    return new Example(nodes);
  }
}
