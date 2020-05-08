import { Example } from "../models/examples";

export default [
  "Hello! Today I met a new friend! {Sub} {has} a wonderful personality. That smile of {pp} really makes me happy. I could talk to {obj} all day, although {sub} {doesn't} talk about {ref} much. I wonder if {pd} day has been wonderful. I hope so! ",
].map((s) => Example.parse(s));
