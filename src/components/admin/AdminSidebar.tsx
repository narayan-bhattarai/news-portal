import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, Layers, Settings, MessageSquare, Mail, LogOut } from 'lucide-react';
import { api } from '../../services/api';

import './AdminSidebar.css';


export default function AdminSidebar({ theme }: { theme?: string }) {
    const navigate = useNavigate();

    const currentUser = api.getCurrentUser();
    const isAdmin = currentUser?.role === 'Admin';

    const currentTheme = theme || localStorage.getItem('theme') || 'light';
    const logoSrc = currentTheme === 'dark' ? '/everestedit_dark.png' : '/everestedit.png';

    const renderLogo = () => {
        return (
            <div className="admin-logo" onClick={() => navigate('/admin/articles')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
                <img src={logoSrc} alt="Logo" style={{ height: '80px', width: 'auto' }} />
            </div>
        );
    };

    return (
        <aside className="admin-sidebar">
            {renderLogo()}

            <nav className="sidebar-nav">
                <NavLink to="/admin/articles" className={({ isActive }) => isActive ? 'active' : ''}>
                    <LayoutDashboard size={20} /> Articles
                </NavLink>

                {isAdmin && (
                    <>
                        <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'active' : ''}>
                            <List size={20} /> Categories
                        </NavLink>
                        <NavLink to="/admin/pages" className={({ isActive }) => isActive ? 'active' : ''}>
                            <Layers size={20} /> Pages
                        </NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
                            <Settings size={20} /> Users
                        </NavLink>
                        <NavLink to="/admin/messages" className={({ isActive }) => isActive ? 'active' : ''}>
                            <Mail size={20} /> Inbox
                        </NavLink>
                    </>
                )}

                <NavLink to="/admin/chat" className={({ isActive }) => isActive ? 'active' : ''}>
                    <MessageSquare size={20} /> Team Chat
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button onClick={() => { api.logout(); navigate('/login'); }} className="sidebar-logout-btn">
                    <LogOut size={20} /> Sign Out
                </button>
            </div>
        </aside>
    );
}
