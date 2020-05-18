export type Declension = "subject" | "object" | "possessive-determiner" | "possessive-pronoun" | "reflexive";
export type DeclensionSet = Record<Declension, string>;
export type PronounNumber = "singular" | "plural";
export type PronounSet = { declensions: DeclensionSet; number: PronounNumber };
export type KnownPronounSet = PronounSet & { preferred?: boolean };

export const allPronouns: Array<KnownPronounSet> = []; // Array filled in later to get around type order issues

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

export function arePronounSetsEqual(
  a: PronounSet,
  b: PronounSet,
  options?: {
    ignoreNumber?: boolean;
    checkOnlyFirst?: number;
  }
): boolean {
  if (!options?.ignoreNumber && a.number != b.number) return false;
  const checkLength = options?.checkOnlyFirst ?? declensionsList.length;
  for (const decl of declensionsList.slice(0, checkLength))
    if (a.declensions[decl] != b.declensions[decl]) return false;
  return true;
}

function createPronounSet(set: PronounSet, numberOverride: PronounNumber | undefined): PronounSet {
  return { declensions: set.declensions, number: numberOverride ?? set.number };
}

function matchPronounSet(
  declensions: Partial<DeclensionSet>,
  options: { numberOverride?: PronounNumber } = {}
): PronounSet | null {
  // Find all pronouns from our list that match the given declensions
  const matches = allPronouns.filter((potentialMatch) => {
    for (const declension of declensionsList) {
      // Skip matching declensions that aren't in the input set
      if (!declensions[declension]) continue;
      if (declensions[declension]?.toLowerCase() != potentialMatch.declensions[declension].toLowerCase()) return false;
    }
    return true;
  });

  // If we don't have any matches at all, we're done
  if (matches.length === 0) return null;

  // If we have exactly one match, return that (and apply number override if needed)
  if (matches.length === 1) return createPronounSet(matches[0], options.numberOverride);

  // If we have *more than one match*:
  // - If there's an explicit number override, see if there's exactly one match with that number
  if (options.numberOverride) {
    const matchesWithNumber = matches.filter((p) => p.number === options.numberOverride);
    if (matchesWithNumber.length === 1) return matchesWithNumber[0];
  }

  // - See if there's exactly one *preferred set* (eg. they/them w. plural-form reflexive)
  // (TODO: should we handle there being multiple results here differently?)
  const preferredMatches = matches.filter((m) => m.preferred);
  if (preferredMatches.length === 1) return createPronounSet(matches[0], options.numberOverride);

  // - If there isn't, we declare the match ambiguous (TODO: should we return the match list, then?).
  return null;
}

export function parse(format: string, findShorthand?: boolean): PronounSet {
  // Input format: sub/obj/posd/posp/ref[/number]
  // eg. they/them/their/theirs/themselves/plural

  const segments = format.split("/");

  // We check if the last segment is a number specifier (singular/plural) - if so, set it aside and remove it
  let givenNumber: PronounNumber | undefined;
  const lastSegment = segments[segments.length - 1];
  if (lastSegment === "singular" || lastSegment === "plural") {
    givenNumber = lastSegment;
    segments.pop(); // don't also count it as a declension
  }

  const givenDeclensions: Partial<DeclensionSet> = {
    subject: segments.length > 0 ? segments[0] : undefined,
    object: segments.length > 1 ? segments[1] : undefined,
    "possessive-determiner": segments.length > 2 ? segments[2] : undefined,
    "possessive-pronoun": segments.length > 3 ? segments[3] : undefined,
    reflexive: segments.length > 4 ? segments[4] : undefined,
  };

  // Try to find a short-hand match handling missing segments gracefully
  // This is done "early" to fetch the proper pronoun number even in the absence of an override
  const matchedSet = findShorthand ? matchPronounSet(givenDeclensions, { numberOverride: givenNumber }) : null;
  if (matchedSet !== null) return matchedSet;

  // If we didn't get a match, then see if we can construct it directly
  if (segments.length < 5) throw new Error("Pronoun string must contain at least five segments.");
  if (segments.length > 6) throw new Error("Pronoun string must contain at most six segments.");

  // (we know that we were given at least five segments, so givenDeclensions will always be filled out)
  return { declensions: givenDeclensions as DeclensionSet, number: givenNumber ?? "singular" };
}

function shortestPathLength(ps: PronounSet): { length: number; needNumberTag: boolean } {
  for (let i = 1; i <= declensionsList.length; i++) {
    // Find pronoun sets that match the first i entries
    const matches = allPronouns.filter((kp) => arePronounSetsEqual(kp, ps, { checkOnlyFirst: i, ignoreNumber: true }));

    // If there's nothing at all, we need the full path for sure
    if (matches.length == 0) return { length: declensionsList.length, needNumberTag: ps.number != "singular" };

    // If we have exactly one result...
    if (matches.length == 1) {
      // Just make sure it's the one we're looking for
      if (arePronounSetsEqual(ps, matches[0], { ignoreNumber: true }))
        return { length: i, needNumberTag: ps.number != matches[0].number };
      else return { length: declensionsList.length, needNumberTag: ps.number != "singular" };
    }

    // If we have multiple results, see if there's a tie breaker
    const preferred = matches.filter((kp) => kp.preferred);
    if (preferred.length == 1 && arePronounSetsEqual(ps, preferred[0], { ignoreNumber: true }))
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

// Now we fill in the array defined above
allPronouns.push(
  ...[
    { ...parse("he/him/his/his/himself"), preferred: true },
    { ...parse("she/her/her/hers/herself"), preferred: true },
    { ...parse("they/them/their/theirs/themselves/plural"), preferred: true },
    { ...parse("they/them/their/theirs/themself/plural") },
    { ...parse("ey/em/eir/eirs/eirself"), preferred: true },
    { ...parse("xe/xem/xyr/xyrs/xemself"), preferred: true },
    { ...parse("xe/xem/xir/xyrs/xemself") },
    { ...parse("ze/zem/zes/zes/zirself"), preferred: true },
    { ...parse("ze/hir/hir/hirs/hirself"), preferred: true },
    { ...parse("it/it/its/its/itself"), preferred: true },
    { ...parse("kit/kit/kits/kits/kitself"), preferred: true },
    { ...parse("star/star/star/star/starself"), preferred: true },
    { ...parse("nya/nyan/nyan/nyan/nyanself"), preferred: true },
    { ...parse("fae/faer/faer/faers/faerself"), preferred: true },
  ]
);
