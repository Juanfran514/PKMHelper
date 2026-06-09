import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

export default function Sidebar() {
    const location = useLocation();
    const { user } = useAuth();

    return (
        <aside className="custom-sidebar">

            <div className="sidebar-header">
                <div className="logo-placeholder">T!</div>
            </div>

            <nav className="sidebar-nav">
                <Link
                    to="/"
                    className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                >
                    DASHBOARD
                </Link>

                <Link
                    to="/teambuilder"
                    className={`nav-item ${location.pathname === '/teambuilder' ? 'active' : ''}`}
                >
                    TEAMBUILDER
                </Link>

                <Link
                    to="/teams"
                    className={`nav-item ${location.pathname === '/teams' ? 'active' : ''}`}
                >
                    META TEAMS
                </Link>

                <Link
                    to="/match-history"
                    className={`nav-item ${location.pathname === '/match-history' ? 'active' : ''}`}
                >
                    MATCH HISTORY
                </Link>
            </nav>

            <Link
                to="/profile"
                className="user-profile"
                style={{ textDecoration: 'none' }}
            >
                <span style={{ fontSize: '24px', marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z" />
                    </svg>
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>{user?.username}</span>
            </Link>


        </aside>
    );
}