import { parse, PronounSet } from "../models/pronouns";

export type KnownPronounSet = PronounSet & { preferred?: boolean };

export const allPronouns: Array<KnownPronounSet> = [
  { ...parse("he/him/his/his/himself"), preferred: true },
  { ...parse("she/her/her/hers/herself"), preferred: true },
  { ...parse("they/them/their/theirs/themself/plural") },
  { ...parse("they/them/their/theirs/themselves/plural"), preferred: true },
  { ...parse("ey/em/eir/eirs/eirself"), preferred: true },
  { ...parse("it/it/its/its/itself"), preferred: true },
  { ...parse("nya/nyan/nyan/nyan/nyanself"), preferred: true },
  { ...parse("kit/kit/kits/kits/kitself"), preferred: true },
  { ...parse("star/star/star/star/starself"), preferred: true },
];
