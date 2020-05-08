export type PronounType = "subject" | "object" | "possessive-determiner" | "possessive-pronoun" | "reflexive";

export class PronounSet {
    constructor(
        public readonly subject: string,
        readonly object: string,
        readonly possessiveDeterminer: string,
        readonly possessivePronoun: string,
        readonly reflexive: string,
        readonly plural: boolean) { }

    get(type: PronounType): string {
        switch (type) {
            case "subject": return this.subject;
            case "object": return this.object;
            case "possessive-determiner": return this.possessiveDeterminer;
            case "possessive-pronoun": return this.possessivePronoun;
            case "reflexive": return this.reflexive;
        }
    }

    static parse(format: string, isPlural: boolean = false): PronounSet {
        const segments = format.split("/");
        if (segments.length != 5) {
            throw new Error("Pronoun string must contain exactly five slash-delimited segments.");
        }

        return new PronounSet(
            segments[0], segments[1], segments[2], segments[3], segments[4], isPlural
        );
    }
}