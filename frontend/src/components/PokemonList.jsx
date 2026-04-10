import '../styles/PokemonList.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PokemonCard from './pokemonCard';


function PokemonList({pokemonData}){
    return (
        <Container fluid className = "pokemon-list">
            <Row>
                {pokemonData.map((pokemon, index) => (
                    // Este Col es el que dicta el ancho. 
                    // md={6} significa que ocupará la mitad de la pantalla (2 cartas por fila)
                    <Col key={pokemon.name || index} xs={12} md={6} lg={4} className="mb-4">
                        <PokemonCard name={pokemon.name} usage={pokemon.usage} />
                    </Col>
                ))}
            </Row>
        </Container>
    )
}

export default PokemonList;