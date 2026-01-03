import { Search, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const CATEGORIES = ['World', 'Business', 'Technology', 'Sports', 'Entertainment'];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="navbar-wrapper">
            <nav className="navbar">
                <div className="container navbar-container">
                    <div className="navbar-logo">
                        <span className="logo-accent">खबर</span> मञ्च
                        <div className="navbar-dot"></div>
                    </div>

                    {/* Desktop Menu */}
                    <ul className="navbar-links">
                        <li><a href="#" className="active">Home</a></li>
                        <li><a href="#world">World</a></li>
                        <li><a href="#business">Business</a></li>
                        <li><a href="#technology">Technology</a></li>
                        <li><a href="#entertainment">Entertainment</a></li>
                        <li><a href="#sports">Sports</a></li>
                    </ul>

                    <div className="navbar-actions">
                        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <div className="search-box">
                            <input type="text" placeholder="Search news..." />
                            <Search className="search-icon" size={18} />
                        </div>
                        <button className="icon-btn user-btn" aria-label="User Profile">
                            <User size={20} />
                        </button>
                        <button
                            className="icon-btn mobile-menu-btn"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <ul className="mobile-links">
                    <li><a href="#" onClick={() => setIsMenuOpen(false)}>Home</a></li>
                    {CATEGORIES.map((cat) => (
                        <li key={cat}>
                            <a href={`#${cat.toLowerCase()}`} onClick={() => setIsMenuOpen(false)}>{cat}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
}
