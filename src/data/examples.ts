import { parse } from "../models/examples";

export default [
  "Hello! Today I met a new friend, and {s} [is/are] really nice. {S} [has/have] a wonderful personality. That smile of {pp} really makes me happy. I could talk to {o} all day, although {s} [doesn't/don't] talk about {r} much. I wonder if {pd} day has been wonderful. I hope so! ",
].map(parse);
