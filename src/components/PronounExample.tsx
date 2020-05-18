import { Fragment } from "react";
import { Example, NodeInstance } from "../models/examples";
import { declensionsList, PronounSet } from "../models/pronouns";
import PronounNode from "./PronounNode";

export interface PronounExampleProps {
  example: Example;
  pronouns: PronounSet;
}

function ensureTrailingSpace(s: string): string {
  if (s.endsWith(" ")) return s;
  return s + " ";
}

function renderComponent(pronouns: PronounSet, node: NodeInstance): JSX.Element {
  // Render text and numbered nodes as fragments so they're inlined as text nodes in the DOM (fewer elements)
  // Nodes need a trailing space after each other to make sure everything's properly spaced and words don't clash together
  switch (node.type) {
    case "text":
      return <Fragment key={node.id}>{ensureTrailingSpace(node.text)}</Fragment>;
    case "pronoun":
      return (
        <Fragment key={node.id}>
          <PronounNode pronouns={pronouns} declension={node.declension} casing={node.casing} />{" "}
        </Fragment>
      );
    case "number":
      const value = pronouns.number == "singular" ? node.singular : node.plural;
      return <Fragment key={node.id}>{ensureTrailingSpace(value)}</Fragment>;
  }
}

function title(ps: PronounSet): JSX.Element {
  return (
    <Fragment>
      {declensionsList.map((decl, idx) => (
        <Fragment key={decl}>
          <PronounNode pronouns={ps} declension={decl} casing="lower" tooltipLocation="bottom" />
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
