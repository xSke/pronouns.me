import { Example } from "../models/examples";

export default [
    "{Sub} {is} the coolest person ever. I really like {obj}, and how {sub} {has} so many nice interests. {Sub} brought {pd} frisbee - at least I think it was {pp}. {Sub} threw the frisbee to {ref}. {Sub} {has} now lost."
].map(Example.parse);