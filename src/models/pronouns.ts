import { allPronouns, KnownPronounSet } from "../data/pronouns";

export type Declension = "subject" | "object" | "possessive-determiner" | "possessive-pronoun" | "reflexive";
export type PronounNumber = "singular" | "plural";

export type DeclensionSet = Record<Declension, string>;

export interface PronounSet {
  declensions: DeclensionSet;
  number: PronounNumber;
}

// In order
export const declensionsList: Array<Declension> = [
  "subject",
  "object",
  "possessive-determiner",
  "possessive-pronoun",
  "reflexive",
];

export const declensionNames: Record<Declension, string> = {
  subject: "Subject",
  object: "Object",
  "possessive-determiner": "Possessive determiner",
  "possessive-pronoun": "Possessive pronoun",
  reflexive: "Reflexive pronoun",
};

function toDeclensionList(ps: PronounSet): string[] {
  return declensionsList.map((d) => ps.declensions[d].toLowerCase());
}

function createPronounFromSegments(segments: string[]): PronounSet {
  const declensions: DeclensionSet = {
    subject: segments[0],
    object: segments[1],
    "possessive-determiner": segments[2],
    "possessive-pronoun": segments[3],
    reflexive: segments[4],
  };

  let number: PronounNumber = "singular";
  if (segments.length >= 6) {
    if (segments[5] != "singular" && segments[5] != "plural")
      throw new Error("Number must be either 'singular' or 'plural'.");
    number = segments[5];
  }
  return {
    declensions: declensions,
    number: number,
  };
}

function tryFindShorthandMatch(segments: string[]): PronounSet {
  let n = segments.length;

  // Check for a number marker at the end
  let numberOverride: PronounNumber | undefined;
  if (segments[n - 1] == "singular" || segments[n - 1] == "plural") {
    numberOverride = segments[--n] as PronounNumber;
  }

  // Find all the known pronouns that could potentially match this shorthand
  const matches: Array<KnownPronounSet> = allPronouns.filter((knownPronoun) => {
    // JS array equality >.>
    return toDeclensionList(knownPronoun).slice(0, n).join("/") == segments.slice(0, n).join("/");
  });

  // Handle the obvious cases (no match, one match)
  if (matches.length == 0) {
    // If we have enough material to construct a full pronoun set, do that, otherwise error
    if (n >= 5) return createPronounFromSegments(segments);
    throw new Error(`Pronoun matching shorthand '${segments.join("/")}' was not found.`);
  }

  if (matches.length == 1) {
    const match = matches[0];
    return { ...match, number: numberOverride ?? match.number };
  }

  // Potential ambiguity, see if we have a single preferred form
  for (const match of matches) {
    if (match.preferred) return { ...match, number: numberOverride ?? match.number };
  }

  throw new Error(`Pronoun shorthand '${segments.join("/")}' is ambiguous.`);
}

export function parse(format: string, findShorthand?: boolean): PronounSet {
  // Input format: sub/obj/posd/posp/ref[/number]
  // eg. they/them/their/theirs/themselves/plural
  const segments = format.split("/");
  if (findShorthand) return tryFindShorthandMatch(segments);
  if (segments.length < 5) throw new Error("Pronoun string must contain at least five segments.");
  if (segments.length > 6) throw new Error("Pronoun string must contain at most six segments.");
  return createPronounFromSegments(segments);
}

export function setsEqual(
  a: PronounSet,
  b: PronounSet,
  options?: {
    ignoreNumber?: boolean;
    checkLength?: number;
  }
): boolean {
  if (!options?.ignoreNumber && a.number != b.number) return false;
  const checkLength = options?.checkLength ?? declensionsList.length;
  for (const decl of declensionsList.slice(0, checkLength))
    if (a.declensions[decl] != b.declensions[decl]) return false;
  return true;
}

function shortestPathLength(ps: PronounSet): { length: number; needNumberTag: boolean } {
  for (let i = 1; i <= declensionsList.length; i++) {
    // Find pronoun sets that match the first i entries
    const matches = allPronouns.filter((kp) => setsEqual(kp, ps, { checkLength: i, ignoreNumber: true }));

    // If there's nothing at all, we need the full path for sure
    if (matches.length == 0) return { length: declensionsList.length, needNumberTag: ps.number != "singular" };

    // If we have exactly one result...
    if (matches.length == 1) {
      // Just make sure it's the one we're looking for
      if (setsEqual(ps, matches[0], { ignoreNumber: true }))
        return { length: i, needNumberTag: ps.number != matches[0].number };
      else return { length: declensionsList.length, needNumberTag: ps.number != "singular" };
    }

    // If we have multiple results, see if there's a tie breaker
    const preferred = matches.filter((kp) => kp.preferred);
    if (preferred.length == 1 && setsEqual(ps, preferred[0], { ignoreNumber: true }))
      return { length: i, needNumberTag: ps.number != preferred[0].number };

    // If not, keep searching...
  }

  // Didn't find any, need the full path.
  return { length: declensionsList.length, needNumberTag: ps.number != "singular" };
}

export function toTemplate(ps: PronounSet, options?: { shorten?: boolean; includeNumber?: boolean }): string {
  const { length, needNumberTag } = options?.shorten
    ? shortestPathLength(ps)
    : { length: declensionsList.length, needNumberTag: ps.number != "singular" };

  const path = toDeclensionList(ps).slice(0, length).join("/");
  if (options?.includeNumber !== undefined) {
    if (options?.includeNumber) return path + "/" + ps.number;
    return path;
  }
  if (needNumberTag) return path + "/" + ps.number;
  return path;
}
