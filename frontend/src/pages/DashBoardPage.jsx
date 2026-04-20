import React from 'react';
import PokemonData from '../../../backend/data/competitive_sets.json';
import PokemonList from '../components/PokemonList';
import SearchBar from '../components/SearchBar';
import { usePokemonFilter } from "../hooks/usePokemonFilter";
import StatList from '../components/StatList';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';

const DashboardPage = () => {
  const { query, setQuery, datosFiltrados } = usePokemonFilter(PokemonData);

  return (
    <div className="dashboard-page">
      <SearchBar value={query} onChange={setQuery} />
      <PokemonList pokemonData={datosFiltrados} />
      <StatList elo="1500" winrate="55%" glicko="1600" />

    </div>
    

  );

};

export default DashboardPage;