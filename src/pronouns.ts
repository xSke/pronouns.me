/**
 * A pronoun declension, ie. a possible "sentence position" a pronoun can be in.
 *
 * The possible values are as follows:
 * - "subject": eg. **He** is nice.
 * - "object": eg. I like **him**.
 * - "possessive-determiner": eg. **Their** socks are grey.
 * - "possessive-pronoun": eg. The ball is **hers**.
 * - "reflexive": eg. She did it **herself**.
 */
export type Declension = "subject" | "object" | "possessive-determiner" | "possessive-pronoun" | "reflexive";

/** A full set of values for every possible declension. */
export type DeclensionSet = Record<Declension, string>;

/** Whether this pronoun set should conjugate verbs as singular (he **is**) or plural (they **are**). */
export type PronounNumber = "singular" | "plural";

/** An array of the available declensions (eg. keys in DeclensionSet objects), in order of listing convention. */
export const declensionsList: Array<Declension> = [
  "subject",
  "object",
  "possessive-determiner",
  "possessive-pronoun",
  "reflexive",
];

/** All the pronoun sets this app knows of. */
export const allPronouns: Array<PronounSet> = []; // Array filled in later to get around type order issues

/** Attempts to find the shortest possible "declension path" that'll uniquely identify this pronoun set in the known pronouns list. */
export function shortestPathLength(given: PronounSet): { length: number; needNumberTag: boolean } {
  for (let i = 1; i <= declensionsList.length; i++) {
    // Find pronoun sets that match the first i entries
    const matches = allPronouns.filter((kp) => kp.equals(given, { checkOnlyFirst: i, ignoreNumber: true }));

    // If there's nothing at all, we need the full path for sure
    if (matches.length == 0) return { length: declensionsList.length, needNumberTag: given.number != "singular" };

    // If we have exactly one result...
    if (matches.length == 1) {
      // Just make sure it's the one we're looking for
      if (given.equals(matches[0], { ignoreNumber: true }))
        return { length: i, needNumberTag: given.number != matches[0].number };
      else return { length: declensionsList.length, needNumberTag: given.number != "singular" };
    }

    // If we have multiple results, see if the first one is correct (as that'll be resolved)
    if (matches[0].equals(given, { ignoreNumber: true }))
      return { length: i, needNumberTag: given.number != matches[0].number };

    // If not, keep searching...
  }

  // Didn't find any, need the full path.
  return { length: declensionsList.length, needNumberTag: given.number != "singular" };
}

export class PronounSet {
  private _cachedUrl?: string;

  constructor(public declensions: DeclensionSet, public number: PronounNumber) {}

  static from(
    subject: string,
    object: string,
    possessiveDeterminer: string,
    possessivePronoun: string,
    reflexive: string,
    number: PronounNumber = "singular"
  ): PronounSet {
    return new PronounSet(
      {
        subject: subject,
        object: object,
        "possessive-determiner": possessiveDeterminer,
        "possessive-pronoun": possessivePronoun,
        reflexive: reflexive,
      },
      number
    );
  }

  static match(declensions: Partial<DeclensionSet>, numberOverride: PronounNumber | undefined): PronounSet | null {
    // Find all pronouns from our list that match the given declensions
    const matches = allPronouns.filter((potentialMatch) => {
      for (const declension of declensionsList) {
        // Skip matching declensions that aren't in the input set (empty string is valid!)
        if (declensions[declension] === undefined) continue;
        if (declensions[declension]?.toLowerCase() != potentialMatch.declensions[declension].toLowerCase())
          return false;
      }
      return true;
    });

    // If we don't have any matches at all, we're done
    if (matches.length === 0) return null;

    // If we have exactly one match, return that (and apply number override if needed)
    if (matches.length === 1) return matches[0].withNumber(numberOverride);

    // If we have *more than one match*:
    // - If there's an explicit number override, see if there's exactly one match with that number
    if (numberOverride) {
      const matchesWithNumber = matches.filter((p) => p.number === numberOverride);
      if (matchesWithNumber.length === 1) return matchesWithNumber[0];
    }

    // - Otherwise, return the first set we have. This is usually ordered so that's the most "common" one.
    return matches[0].withNumber(numberOverride);
  }

  static fromUrl(url: string): PronounSet | null {
    // Skip leading slash
    if (url.startsWith("/")) url = url.substr(1);

    // First we split the url into segments (with URI decoding)
    const segments = url.split("/").map(decodeURIComponent);

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
    const matchedSet = PronounSet.match(givenDeclensions, givenNumber);
    if (matchedSet !== null) return matchedSet;

    // If we didn't get a match, then see if we can construct it directly
    if (segments.length < 5) throw new Error("Pronoun string must contain at least five segments.");
    if (segments.length > 6) throw new Error("Pronoun string must contain at most six segments.");

    // (we know that we were given at least five segments, so givenDeclensions will always be filled out)
    return new PronounSet(givenDeclensions as DeclensionSet, givenNumber ?? "singular");
  }

  equals(
    other: PronounSet,
    options?: {
      /** Whether to ignore the pronoun sets' numbers when comparing. Default false. */
      ignoreNumber?: boolean;

      /** If set, will check only this many declensions (in order of {@link declensionsList}). */
      checkOnlyFirst?: number;
    }
  ): boolean {
    if (!options?.ignoreNumber && this.number != other.number) return false;

    const checkLength = options?.checkOnlyFirst ?? declensionsList.length;
    for (const decl of declensionsList.slice(0, checkLength))
      if (this.declensions[decl].toLowerCase().trim() !== other.declensions[decl].toLowerCase().trim()) return false;

    return true;
  }

  withNumber(number: PronounNumber | undefined): PronounSet {
    return new PronounSet(this.declensions, number ?? this.number);
  }

  get(decl: Declension): string {
    return this.declensions[decl];
  }

  toDeclensionList(): Array<string> {
    return declensionsList.map((d) => this.declensions[d]);
  }

  toFullPath(): string {
    return [...this.toDeclensionList(), this.number].join("/");
  }

  isUrlSafe(): boolean {
    for (const decl of Object.values(this.declensions)) {
      if (!decl) return false; // If empty/blank
      if (/^[\./]+$/.exec(decl)) return false; // If only consists of .s and /s
      if (decl.startsWith("/") || decl.endsWith("/")) return false; // These interfere with URL normalization
    }
    return true;
  }

  toUrl(): string | null {
    // Don't recalculate unnecessarily
    if (this._cachedUrl) return this._cachedUrl;
    if (!this.isUrlSafe()) return null;

    const { length, needNumberTag } = shortestPathLength(this);
    const path = this.toDeclensionList()
      .slice(0, length)
      .map((s) => encodeURIComponent(s.trim()))
      .join("/");
    if (needNumberTag) this._cachedUrl = "/" + path + "/" + this.number;
    else this._cachedUrl = "/" + path;

    return this._cachedUrl;
  }
}

/** A map from declensions to a human-readable formatted declension name (for display purposes). */
export const declensionNames: Record<Declension, string> = {
  subject: "Subject",
  object: "Object",
  "possessive-determiner": "Possessive determiner",
  "possessive-pronoun": "Possessive pronoun",
  reflexive: "Reflexive pronoun",
};

// Now we fill in the array defined above
allPronouns.push(
  ...[
    "he/him/his/his/himself",
    "she/her/her/hers/herself",
    "they/them/their/theirs/themselves/plural",
    "fae/faer/faer/faers/faerself",
    "ey/em/eir/eirs/eirself",
    "xe/xem/xyr/xyrs/xemself",
    "xe/xem/xir/xyrs/xemself",
    "ze/zem/zes/zes/zirself",
    "ze/hir/hir/hirs/hirself",
    "it/it/its/its/itself",
    "kit/kit/kits/kits/kitself",
    "star/star/star/star/starself",
    "nya/nyan/nyan/nyan/nyanself",
  ].map((p) => {
    const segs = p.split("/");
    return PronounSet.from(segs[0], segs[1], segs[2], segs[3], segs[4], segs[5] as PronounNumber);
  })
);
