import pronouns from "../data/pronouns";
import examples from "../data/examples";

function HomePage() {
    const example = examples[0];

    return (
        <div>
            <h3>Pronoun example:</h3>

            <ul>
                {pronouns.map(pronoun => (
                    <li key={pronoun.toString()}>{example.apply(pronoun)}</li>
                ))}
            </ul>
        </div>
    );
}

export default HomePage;