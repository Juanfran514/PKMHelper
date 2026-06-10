// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap'; // Importación más limpia
import PokemonList from '../components/PokemonList';
import SearchBar from '../components/SearchBar';
import { usePokemonFilter } from "../hooks/usePokemonFilter";
import StatList from '../components/StatList';
import ArchetypeList from '../components/ArchetypeList';
import PokemonData from '../../../backend/data/competitive_sets.json';

// Importamos tu nuevo archivo de estilos
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const { query, setQuery, datosFiltrados } = usePokemonFilter(PokemonData);
  const [stats, setStats] = useState({ elo: "1500", winrate: "0%" });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-page container-fluid px-4 py-3">
      <Row className="h-100">

        <Col lg={9} className="main-dashboard-col">
          <SearchBar value={query} onChange={setQuery} />
          <PokemonList pokemonData={datosFiltrados} />
          <StatList elo={stats.elo} winrate={stats.winrate} />
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