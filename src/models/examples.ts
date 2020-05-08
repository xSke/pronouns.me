import { PronounSet, PronounType } from "./pronouns";


export interface ExampleComponentText {
    type: "text";
    text: string;
}

export interface ExampleComponentPronoun {
    type: "pronoun";
    case: PronounType
}

export interface ExampleComponentPluralityDependent {
    type: "plural-dependent",
    singular: string,
    plural: string
}

export type ExampleComponentPayload = ExampleComponentText | ExampleComponentPronoun | ExampleComponentPluralityDependent;

export type ExampleComponent = {
    capitalize: boolean
} & ExampleComponentPayload;


const componentTags: Record<string, ExampleComponentPayload> = {
    "sub": { type: "pronoun", case: "subject" },
    "obj": { type: "pronoun", case: "object" },
    "pd": { type: "pronoun", case: "possessive-determiner" },
    "pp": { type: "pronoun", case: "possessive-pronoun" },
    "ref": { type: "pronoun", case: "reflexive" },

    // they/them pronouns are unique across all forms (so are "we" and "I")
    "they": { type: "pronoun", case: "subject" },
    "them": { type: "pronoun", case: "object" },
    "their": { type: "pronoun", case: "possessive-determiner" },
    "theirs": { type: "pronoun", case: "possessive-pronoun" },
    "themselves": { type: "pronoun", case: "reflexive" },
    "themself": { type: "pronoun", case: "reflexive" },

    // Plural-dependent words (need to add more?)
    "is": { type: "plural-dependent", singular: "is", plural: "are" },
    "are": { type: "plural-dependent", singular: "is", plural: "are" },
    "have": { type: "plural-dependent", singular: "has", plural: "have" },
    "has": { type: "plural-dependent", singular: "has", plural: "have" },
};

export class Example {
    constructor(private components: ExampleComponent[]) { }

    static parse(format: string): Example {
        // format: {Sub} is very {obj}, etc etc.
        const regex = /{(\w+)}/g; // search for {tags}

        const components: ExampleComponent[] = [];
        let match, lastPosition = 0;
        while ((match = regex.exec(format)) !== null) {
            // Add leading text component
            if (match.index > 0) {
                const textSegment = format.slice(lastPosition, match.index);
                components.push({ type: "text", text: textSegment, capitalize: false });
            }

            // Add tagged component
            const tag = match[1];
            const component = componentTags[tag.toLowerCase()];
            if (!component) throw new Error(`Unknown tag '${tag}'.`);

            components.push({
                capitalize: tag[0] != tag[0].toLowerCase(),
                ...component
            });

            lastPosition = match.index + match[0].length;
        }

        // Add trailing text component
        if (lastPosition < format.length) {
            components.push({ type: "text", text: format.slice(lastPosition), capitalize: false });
        }

        return new Example(components);
    }

    apply(pronouns: PronounSet): string {
        let output = [];
        for (const component of this.components) {
            if (component.type == "text") {
                output.push(component.text);
            } else if (component.type == "pronoun") {
                let pronounUse = pronouns.get(component.case);

                if (component.capitalize)
                    pronounUse = pronounUse[0].toUpperCase() + pronounUse.slice(1).toLowerCase();
                else pronounUse = pronounUse.toLowerCase();

                output.push(pronounUse);
            } else if (component.type == "plural-dependent") {
                if (pronouns.plural)
                    output.push(component.plural);
                else
                    output.push(component.singular);
            }
        }
        return output.join("");
    }
}