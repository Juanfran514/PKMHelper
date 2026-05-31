import { Outlet } from 'react-router-dom';
import Sidebar from '../components/SideBar';

export default function MainLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
            <Sidebar />

            <main style={{ flex: 1, padding: '2rem', background: 'transparent', overflowY: 'auto' }}>
                <Outlet />
            </main>
        </div>
    );
}