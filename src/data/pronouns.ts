import { PronounSet } from "../models/pronouns";

export default [
    "she/her/her/hers/herself"
].map(s => PronounSet.parse(s));