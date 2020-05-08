import { Fragment } from "react";
import { Example, NodeInstance } from "../models/examples";
import { PronounSet } from "../models/pronouns";
import PronounNode from "./pronoun-node";

export interface PronounExampleProps {
  example: Example;
  pronouns: PronounSet;
}

function renderComponent(p: PronounSet, c: NodeInstance): JSX.Element {
  // Render text and numbered nodes as fragments so they're inlined as text nodes in the DOM (fewer elements)
  switch (c.type) {
    case "text":
      return <Fragment key={c.id}>{c.text}</Fragment>;
    case "pronoun":
      return <PronounNode set={p} node={c} />;
    case "number":
      return (
        <Fragment key={c.id}>
          {p.number == "singular" ? c.singular : c.plural}
        </Fragment>
      );
  }
}

export default function PronounExample(prop: PronounExampleProps): JSX.Element {
  return (
    <Fragment>
      {prop.example.nodes.map((c) => renderComponent(prop.pronouns, c))}
    </Fragment>
  );
}
