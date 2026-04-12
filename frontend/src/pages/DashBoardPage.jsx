import React from 'react';
import PokemonData from '../../../backend/data/competitive_sets.json';
import PokemonList from '../components/PokemonList';
import SearchBar from '../components/SearchBar';
import { usePokemonFilter } from "../hooks/usePokemonFilter";

const DashboardPage = () => {
  const { query, setQuery, datosFiltrados } = usePokemonFilter(PokemonData);

  return (
    <div className="dashboard-page">
      <SearchBar value={query} onChange={setQuery} />
      <PokemonList pokemonData={datosFiltrados} />
    </div>
  );
};

export default DashboardPage;