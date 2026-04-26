import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css'; 

export default function Sidebar() {
    const location = useLocation();

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
                <span style={{ fontSize: '28px' }}>👤</span>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>NICKNAME</span>
            </Link>


        </aside>
    );
}