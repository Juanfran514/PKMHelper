import { Outlet } from 'react-router-dom';
import Sidebar from '../components/SideBar';

export default function MainLayout() {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <Sidebar />

            <main style={{ flex: 1, padding: '2rem', background: 'transparent', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
}