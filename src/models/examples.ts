import { PronounSet, PronounType } from "./pronouns";


export interface ExampleComponentText {
    type: "text";
    text: string;
}

export interface ExampleComponentPronoun {
    type: "pronoun";
    case: PronounType,
    uppercase: boolean
}

export type ExampleComponent = ExampleComponentText | ExampleComponentPronoun;

const aliases: Record<string, PronounType> = {
    "sub": "subject",
    "obj": "object",
    "pd": "possessive-determiner",
    "pp": "possessive-pronoun",
    "ref": "reflexive"
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
                components.push({ type: "text", text: textSegment });
            }

            // Add pronoun component
            // Fetch pronoun case from the aliases map above (case-insensitive)
            // If the *given* tag is Uppercase, set the uppercase flag on the component
            const tag = match[1];
            const pronoun = aliases[tag.toLowerCase()];
            if (pronoun == null)
                throw new Error(`Invalid pronoun tag '${tag}'.`);

            components.push({
                type: "pronoun",
                case: pronoun,
                uppercase: tag[0] != tag[0].toLowerCase()
            });

            lastPosition = match.index + match[0].length;
        }

        // Add trailing text component
        if (lastPosition < format.length) {
            components.push({ type: "text", text: format.slice(lastPosition) });
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

                if (component.uppercase)
                    pronounUse = pronounUse[0].toUpperCase() + pronounUse.slice(1).toLowerCase();
                else pronounUse = pronounUse.toLowerCase();

                output.push(pronounUse);
            }
        }
        return output.join("");
    }
}