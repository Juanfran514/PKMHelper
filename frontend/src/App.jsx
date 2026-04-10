import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import PokemonData from '../../backend/data/competitive_sets.json';
import PokemonList from './components/PokemonList';

function App() {
  return (
    <div className="App">
      <h1>PKMHelper</h1>
      <PokemonList pokemonData={PokemonData} />
    </div>

  );
}

export default App;
