import { Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import AdminSidebar from '../admin/AdminSidebar';
import { api } from '../../services/api';
import './AdminLayout.css';

export default function AdminLayout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const currentUser = api.getCurrentUser();
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <div className="admin-layout">
            <AdminSidebar theme={theme} />
            <main className="admin-main">
                <header className="admin-header global-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div className="header-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>

                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </button>

                        <div className="user-profile-container" ref={profileRef}>
                            <div className="user-profile" style={{ cursor: 'default' }}>
                                <img
                                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.username || 'Admin'}`}
                                    alt="Profile"
                                    className="avatar"
                                    style={{
                                        width: '35px',
                                        height: '35px',
                                        borderRadius: '50%',
                                        background: '#f1f5f9',
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                                <span style={{ fontWeight: 600 }}>{currentUser?.username || 'Admin'}</span>
                            </div>
                        </div>
                    </div>
                </header>
                <Outlet />
            </main>
        </div>
    );
}
