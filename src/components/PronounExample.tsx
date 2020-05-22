import { Fragment } from "react";
import { Example, NodeInstance } from "../examples";
import { declensionsList, PronounSet } from "../pronouns";
import PronounNode from "./PronounNode";

export interface PronounExampleProps {
  example: Example;
  pronouns: PronounSet;
}

export function ExampleNode({ pronouns, node }: { pronouns: PronounSet; node: NodeInstance }): JSX.Element {
  // Render text and numbered nodes as fragments so they're inlined as text nodes in the DOM (fewer elements)
  // Text nodes include the necessary whitespace on either side, so no need to worry about this
  switch (node.type) {
    case "text":
      return <Fragment>{node.text}</Fragment>;
    case "pronoun":
      return <PronounNode pronouns={pronouns} declension={node.declension} casing={node.casing} />;
    case "number":
      const value = pronouns.number == "singular" ? node.singular : node.plural;
      return <Fragment>{value}</Fragment>;
  }
}

function PronounTitle(props: { pronouns: PronounSet }): JSX.Element {
  return (
    <h1>
      {declensionsList.map((decl, idx) => (
        <Fragment key={decl}>
          <PronounNode pronouns={props.pronouns} declension={decl} casing="lower" />
          {idx != declensionsList.length - 1 ? "/" : ""}
        </Fragment>
      ))}
    </h1>
  );
}

export default function PronounExample(prop: PronounExampleProps): JSX.Element {
  return (
    <div>
      <h2>Pronoun example:</h2>
      <PronounTitle pronouns={prop.pronouns} />
      <blockquote style={{ textAlign: "justify" }}>
        {prop.example.nodes.map((node) => (
          <ExampleNode key={node.id} pronouns={prop.pronouns} node={node} />
        ))}
      </blockquote>
    </div>
  );
}
