import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import MainLayout from './layouts/MainLayout';

import DashboardPage from './pages/DashBoardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          
          <Route index element={<DashboardPage />} />
          
          <Route path="teams" element={
            <div className="container mt-4">
              <h2>Teams</h2>
              <p>Pantalla en construcción...</p>
            </div>
          } />
          
          <Route path="teambuilder" element={
            <div className="container mt-4">
              <h2>Teambuilder</h2>
              <p>Pantalla en construcción...</p>
            </div>
          } />

          <Route path="match-history" element={
            <div className="container mt-4">
              <h2>Match History</h2>
              <p>Pantalla en construcción...</p>
            </div>
            
          } />
          
          <Route path="profile" element={
            <div className="container mt-4">
              <h2>Profile</h2>
              <p>Pantalla en construcción...</p>
            </div>
            
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;