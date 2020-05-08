import pronouns from "../data/pronouns";
import examples from "../data/examples";

function HomePage() {
    const pronoun = pronouns[0];
    const example = examples[0];

    return (
        <div>
            <h3>Pronoun example:</h3>

            <p>
                {example.apply(pronoun)}
            </p>
        </div>
    );
}

export default HomePage;