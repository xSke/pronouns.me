import pronouns from "../data/pronouns";
import examples from "../data/examples";

function HomePage() {
    const pronoun = pronouns[0];
    const example = examples[0];

    return (
        <div>
            <h3>Pronoun example:</h3>

            <ul>
                {pronouns.map(pronoun => (
                    <li>{example.apply(pronoun)}</li>
                ))}
            </ul>
        </div>
    );
}

export default HomePage;