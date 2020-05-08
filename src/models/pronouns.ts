export type PronounDeclension = "subject" | "object" | "possessive-determiner" | "possessive-pronoun" | "reflexive";
export type PronounNumber = "singular" | "plural";

export class PronounSet {
    constructor(
        readonly subject: string,
        readonly object: string,
        readonly possessiveDeterminer: string,
        readonly possessivePronoun: string,
        readonly reflexive: string,
        readonly number: PronounNumber) { }

    get(type: PronounDeclension): string {
        switch (type) {
            case "subject": return this.subject;
            case "object": return this.object;
            case "possessive-determiner": return this.possessiveDeterminer;
            case "possessive-pronoun": return this.possessivePronoun;
            case "reflexive": return this.reflexive;
        }
    }

    static parse(format: string, number: PronounNumber = "singular"): PronounSet {
        const segments = format.split("/");
        if (segments.length != 5) {
            throw new Error("Pronoun string must contain exactly five slash-delimited segments.");
        }

        return new PronounSet(
            segments[0], segments[1], segments[2], segments[3], segments[4], number
        );
    }
}