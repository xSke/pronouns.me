import { PronounSet } from "../models/pronouns";

export default [
    PronounSet.parse("she/her/her/hers/herself", "singular"),
    PronounSet.parse("they/them/their/theirs/themselves", "plural"),
];