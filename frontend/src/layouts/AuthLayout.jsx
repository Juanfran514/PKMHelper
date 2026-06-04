import { Outlet } from 'react-router-dom';
import '../styles/AuthStyles.css';

export default function AuthLayout() {
    return (
        <div className="auth-layout">
            <div className="auth-container">
                <div className="auth-left">
                    <img src="/assets/logo.png" alt="Tracker SHOWDOWN!" className="auth-logo" />
                </div>
                <div className="auth-right">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
