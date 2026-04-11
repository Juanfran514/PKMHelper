import '../styles/PokemonCard.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function PokemonCard({name, usage}){
    const displayName = name.length > 25 ? name.substring(0, 25) + '...' : name;
    return (
        <div className="pokemon-card">
            <Row>
                <Col><p className="card-name">{displayName}</p></Col>
                <Col><p className="card-usage">{usage}</p></Col>
            </Row>


        </div>
    )
}

export default PokemonCard;