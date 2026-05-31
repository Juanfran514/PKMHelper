import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ShowdownInfoCard from './ShowdownInfoComponent';

function StatList({elo, winrate, glicko}){
    return(
        <div className="stat-list">
            <Row>
                <Col>
                <div>
                    <ShowdownInfoCard name="Elo" stat={elo}/>
                </div>
                </Col>
                <Col>
                <div>
                    <ShowdownInfoCard name="Win Rate" stat={winrate}/>
                </div>      
                </Col>
                <Col>
                <div>
                    <ShowdownInfoCard name="Glicko" stat={glicko}/>
                </div>       
                </Col>
            </Row>
        </div>

    );
}

export default StatList