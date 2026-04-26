import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { TeamProvider } from './context/TeamContext';

import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashBoardPage';
import TeambuilderPage from './pages/TeambuilderPage';
import PokemonEditor from './pages/PokemonEditor';

function App() {
  return (
    <TeamProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            
            <Route index element={<DashboardPage />} />
            
            <Route path="teams" element={
              <div className="container mt-4 text-white">
                <h2>Teams</h2>
                <p>Pantalla en construcción...</p>
              </div>
            } />
            
            <Route path="teambuilder" element={<TeambuilderPage />} />
            <Route path="teambuilder/editor/:slotIndex" element={<PokemonEditor />} />

            <Route path="match-history" element={
              <div className="container mt-4 text-white">
                <h2>Match History</h2>
                <p>Pantalla en construcción...</p>
              </div>
            } />
            
            <Route path="profile" element={
              <div className="container mt-4 text-white">
                <h2>Profile</h2>
                <p>Pantalla en construcción...</p>
              </div>
            } />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </TeamProvider>
  );
}

export default App;