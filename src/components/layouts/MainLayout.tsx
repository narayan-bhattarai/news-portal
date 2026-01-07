import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function MainLayout() {
    return (
        <div className="main-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}
