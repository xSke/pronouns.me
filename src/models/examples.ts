import { PronounSet, PronounDeclension } from "./pronouns";


export interface ExampleComponentText {
    type: "text";
    text: string;
}

export interface ExampleComponentPronoun {
    type: "pronoun";
    declension: PronounDeclension
}

export interface ExampleComponentNumber {
    type: "number",
    singular: string,
    plural: string
}

export type ExampleComponentPayload = ExampleComponentText | ExampleComponentPronoun | ExampleComponentNumber;

export type ExampleComponent = {
    capitalize: boolean
} & ExampleComponentPayload;


const componentTags: Record<string, ExampleComponentPayload> = {
    "sub": { type: "pronoun", declension: "subject" },
    "obj": { type: "pronoun", declension: "object" },
    "pd": { type: "pronoun", declension: "possessive-determiner" },
    "pp": { type: "pronoun", declension: "possessive-pronoun" },
    "ref": { type: "pronoun", declension: "reflexive" },

    // they/them pronouns are unique across all forms (so are "we" and "I")
    "they": { type: "pronoun", declension: "subject" },
    "them": { type: "pronoun", declension: "object" },
    "their": { type: "pronoun", declension: "possessive-determiner" },
    "theirs": { type: "pronoun", declension: "possessive-pronoun" },
    "themselves": { type: "pronoun", declension: "reflexive" },
    "themself": { type: "pronoun", declension: "reflexive" },

    // Plural-dependent words (need to add more?)
    "is": { type: "number", singular: "is", plural: "are" },
    "are": { type: "number", singular: "is", plural: "are" },
    "was": { type: "number", singular: "was", plural: "were" },
    "were": { type: "number", singular: "was", plural: "were" },
    "have": { type: "number", singular: "has", plural: "have" },
    "has": { type: "number", singular: "has", plural: "have" },
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
                let pronounUse = pronouns.get(component.declension);

                if (component.capitalize)
                    pronounUse = pronounUse[0].toUpperCase() + pronounUse.slice(1).toLowerCase();

                else pronounUse = pronounUse.toLowerCase();

                output.push(pronounUse);
            } else if (component.type == "number") {
                switch (pronouns.number) {
                    case "singular":
                        output.push(component.singular);
                        break;
                    case "plural":
                        output.push(component.plural);
                        break;
                }
            }
        }
        return output.join("");
    }
}