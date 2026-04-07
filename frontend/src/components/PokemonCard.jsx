import '../styles/PokemonCard.css'

function PokemonCard({name, usage}){
    return (
        <div className="pokemon-card">
            <p className="card-name">{name}</p>
            <p className="card-usage">{usage}</p>
        </div>
    )
}

export default PokemonCard;