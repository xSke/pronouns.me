import { Example } from "../models/examples";

export default [
    "{They} {are} the coolest person ever. I really like {them}, and how {they} {have} so many hobbies that interest {them}. {They} {have} now lost the game, all thanks to {themselves}. It's all {their} fault, and only {theirs}."
].map(Example.parse);