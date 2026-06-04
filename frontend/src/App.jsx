import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { TeamProvider } from './context/TeamContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardPage from './pages/DashBoardPage';
import TeambuilderPage from './pages/TeamBuilderPage';
import PokemonEditor from './pages/PokemonEditor';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

import MatchHistoryPage from './pages/MatchHistoryPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />

              <Route path="teams" element={
                <div className="container mt-4 text-white">
                  <h2>Teams</h2>
                  <p>Pantalla en construcción...</p>
                </div>
              } />

              <Route path="teambuilder" element={<TeambuilderPage />} />
              <Route path="teambuilder/editor/:slotIndex" element={<PokemonEditor />} />

              <Route path="match-history" element={<MatchHistoryPage />} />

              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TeamProvider>
    </AuthProvider>
  );
}

export default App;