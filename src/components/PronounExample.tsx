import { Fragment } from "react";
import { Example, NodeInstance } from "../examples";
import { declensionsList, PronounSet } from "../pronouns";
import PronounNode from "./PronounNode";

export interface PronounExampleProps {
  example: Example;
  pronouns: PronounSet;
}

function renderComponent(pronouns: PronounSet, node: NodeInstance): JSX.Element {
  // Render text and numbered nodes as fragments so they're inlined as text nodes in the DOM (fewer elements)
  // Text nodes include the necessary whitespace on either side, so no need to worry about this
  switch (node.type) {
    case "text":
      return <Fragment key={node.id}>{node.text}</Fragment>;
    case "pronoun":
      return (
        <Fragment key={node.id}>
          <PronounNode pronouns={pronouns} declension={node.declension} casing={node.casing} />
        </Fragment>
      );
    case "number":
      const value = pronouns.number == "singular" ? node.singular : node.plural;
      return <Fragment key={node.id}>{value}</Fragment>;
  }
}

function title(ps: PronounSet): JSX.Element {
  return (
    <Fragment>
      {declensionsList.map((decl, idx) => (
        <Fragment key={decl}>
          <PronounNode pronouns={ps} declension={decl} casing="lower" />
          {idx != declensionsList.length - 1 ? "/" : ""}
        </Fragment>
      ))}
    </Fragment>
  );
}

export default function PronounExample(prop: PronounExampleProps): JSX.Element {
  return (
    <div>
      <h2>Pronoun example:</h2>
      <h1>{title(prop.pronouns)}</h1>
      <blockquote style={{ textAlign: "justify" }}>
        {prop.example.nodes.map((c) => renderComponent(prop.pronouns, c))}
      </blockquote>
    </div>
  );
}
