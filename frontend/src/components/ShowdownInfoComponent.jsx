import '../styles/showdownInfoCard.css'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function ShowdownInfoCard({name, stat}){
    const displayName = name.length > 25 ? name.substring(0, 25) + '...' : name;
    return (
        <div className="stat-card">
            <Row>
                <Col><p className="card-name">{displayName}</p></Col>
                <Col><p className="card-stat">{stat}</p></Col>
            </Row>


        </div>
    )
}

export default ShowdownInfoCard;