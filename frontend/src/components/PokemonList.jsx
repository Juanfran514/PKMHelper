import '../styles/PokemonList.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PokemonCard from './PokemonCard';


function PokemonList({pokemonData}){
    return (
        <Container className = "pokemon-list">
            <Row>
                {pokemonData.map((pokemon, index) => (  
                    <Col key={pokemon.name || index} xs={12} md={6} lg={4} className="mb-4">
                        <PokemonCard name={pokemon.name} usage={pokemon.usage} />
                    </Col>
                ))}
            </Row>
        </Container>
    )
}

export default PokemonList;