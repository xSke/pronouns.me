import PronounExample from "../components/pronoun-example";
import examples from "../data/examples";
import pronouns from "../data/pronouns";

export default function HomePage(): JSX.Element {
  const example = examples[0];

  return (
    <div className="container">
      <h3>Pronoun examples:</h3>

      {pronouns.map((pronounSet) => (
        <p key={pronounSet.id}>
          <PronounExample pronouns={pronounSet} example={example} />
        </p>
      ))}
    </div>
  );
}
