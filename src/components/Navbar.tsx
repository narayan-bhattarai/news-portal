import { Search, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Navbar.css';

const CATEGORIES = ['World', 'Business', 'Technology', 'Sports', 'Entertainment']; // Fallback

interface NavbarProps {
    isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [categories, setCategories] = useState<string[]>([]); // State for categories

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        // Fetch categories
        api.getCategories()
            .then((data: { name: string }[]) => setCategories(data.map(c => c.name)))
            .catch(() => setCategories(CATEGORIES)); // Fallback
    }, []);

    // Sync local state with URL param
    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (searchTerm.trim()) {
                navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
            } else {
                navigate('/');
            }
            setIsMenuOpen(false); // Close mobile menu if open
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="navbar-wrapper">
            <nav className="navbar">
                <div className="container navbar-container">
                    <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <span className="logo-accent">खबर</span> मञ्च
                        <div className="navbar-dot"></div>
                    </div>

                    {/* Desktop Menu */}
                    {!isAdmin && (
                        <ul className="navbar-links">
                            <li><a href="/" className={(!searchParams.get('category') && !searchParams.get('search')) ? "active" : ""} onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a></li>
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <a
                                        href={`/?category=${cat}`}
                                        className={searchParams.get('category') === cat ? "active" : ""}
                                        onClick={(e) => { e.preventDefault(); navigate(`/?category=${cat}`); }}
                                    >
                                        {cat}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="navbar-actions">
                        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search news..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                            <Search className="search-icon" size={18} />
                        </div>
                        <button className="icon-btn user-btn" aria-label="User Profile">
                            <User size={20} />
                        </button>
                        {!isAdmin && (
                            <button
                                className="icon-btn mobile-menu-btn"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {!isAdmin && (
                <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                    <ul className="mobile-links">
                        <li><a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); setIsMenuOpen(false); }}>Home</a></li>
                        {categories.map((cat) => (
                            <li key={cat}>
                                <a href={`/?category=${cat}`} onClick={(e) => { e.preventDefault(); navigate(`/?category=${cat}`); setIsMenuOpen(false); }}>{cat}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </header>
    );
}
