import { Example } from "../models/examples";

export default [
    "{Sub} went to the park. I went with {obj}. {Sub} brought {pd} frisbee - at least I think it was {pp}. {Sub} threw the frisbee to {ref}."
].map(Example.parse);