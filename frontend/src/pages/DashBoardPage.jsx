// src/pages/DashboardPage.jsx
import React from 'react';
import { Row, Col } from 'react-bootstrap'; // Importación más limpia
import PokemonData from '../../../backend/data/competitive_sets.json';
import PokemonList from '../components/PokemonList';
import SearchBar from '../components/SearchBar';
import { usePokemonFilter } from "../hooks/usePokemonFilter";
import StatList from '../components/StatList';
import ArchetypeList from '../components/ArchetypeList';

// Importamos tu nuevo archivo de estilos
import '../styles/DashboardPage.css'; 

const DashboardPage = () => {
  const { query, setQuery, datosFiltrados } = usePokemonFilter(PokemonData);

  return (
    <div className="dashboard-page container-fluid px-4 py-3">
      <Row className="h-100">
        
        <Col lg={9} className="main-dashboard-col">
          <SearchBar value={query} onChange={setQuery} />
          <PokemonList pokemonData={datosFiltrados} />
          <StatList elo="1500" winrate="55%" glicko="1600" />
        </Col>

        <Col lg={3} className="extra-data-col">
          <div className="glass-panel">
            <h3 className="panel-title">META ARCHETYPES</h3>
            <div className="panel-content" style={{ marginTop: '2rem' }}>
              <ArchetypeList />
            </div>
          </div>
        </Col>

      </Row>
    </div>
  );
};

export default DashboardPage;