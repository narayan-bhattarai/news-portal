
import NepaliDate from 'nepali-date-converter';
import { Search, User, Menu, X, Sun, Moon, Home } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { config } from '../config';
import './Navbar.css';

const CATEGORIES = ['World', 'Business', 'Technology', 'Sports', 'Entertainment', 'Health'];

interface NavbarProps {
    isAdmin?: boolean;
}

// Helper for Devanagari numerals
const toNepaliDigits = (num: number) => String(num).replace(/\d/g, d => '०१२३४५६७८९'[Number(d)]);

export default function Navbar({ isAdmin = false }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [categories, setCategories] = useState<string[]>([]);
    const [showSearch, setShowSearch] = useState(false);

    // Dates
    const [currentDate, setCurrentDate] = useState('');
    const [nepaliDateStr, setNepaliDateStr] = useState('');

    useEffect(() => {
        // Dynamic English Date
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(date.toLocaleDateString('en-US', options));

        // Dynamic Nepali Date
        try {
            const bs = new NepaliDate(date);
            const months = ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'];
            const days = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];

            // Adjust for library specific indexing if needed. Assuming 0-indexed month/day
            const dStr = `${toNepaliDigits(bs.getDate())} ${months[bs.getMonth()]} ${toNepaliDigits(bs.getYear())}, ${days[bs.getDay()]}`;
            setNepaliDateStr(dStr);
        } catch (e) {
            console.error("Nepali Date Error", e);
            setNepaliDateStr("२२ पौष २०८२, मंगलबार"); // Fallback
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        api.getCategories()
            .then((data: { name: string }[]) => setCategories(data.map(c => c.name)))
            .catch(() => setCategories(CATEGORIES));
    }, []);

    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (searchTerm.trim()) {
                navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
            }
            setShowSearch(false);
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const renderLogo = () => {
        const parts = config.siteName.split(' ');
        const firstWord = parts[0];
        const rest = parts.slice(1).join(' ');
        const logoSrc = theme === 'dark' ? '/everestedit_dark.png' : '/everestedit.png';

        return (
            <div className="main-logo" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img src={logoSrc} alt="Logo" style={{ height: '64px', width: 'auto' }} />
                <span>
                    <span className="logo-accent">{firstWord}</span> {rest}
                </span>
            </div>
        );
    };

    return (
        <header className="navbar-wrapper">
            {/* Top Branding Section */}
            <div className="branding-section">
                {renderLogo()}
                <div className="date-line">
                    <span>{nepaliDateStr || "..."}</span>
                    <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                    <span>{currentDate}</span>
                </div>
            </div>

            {/* Navigation Strip */}
            <nav className="nav-strip">
                <div className="container nav-container">
                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Left Actions (Home) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="nav-icon-btn" onClick={() => navigate('/')} title="Home">
                            <Home size={20} />
                        </button>
                    </div>

                    {/* Centered/Main Links */}
                    {!isAdmin && (
                        <ul className="nav-links">
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

                    {/* Right Actions (Search & Theme) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!isAdmin && (
                            <div style={{ position: 'relative' }}>
                                {showSearch ? (
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        autoFocus
                                        onBlur={() => !searchTerm && setShowSearch(false)}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={handleSearch}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '0.9rem',
                                            width: '200px'
                                        }}
                                    />
                                ) : (
                                    <button className="nav-icon-btn" onClick={() => setShowSearch(true)} title="Search">
                                        <Search size={20} />
                                    </button>
                                )}
                            </div>
                        )}

                        <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {isAdmin && (
                            <button className="nav-icon-btn" title="Admin Profile">
                                <User size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="mobile-menu open" style={{ top: 'auto', position: 'relative', boxShadow: 'none', background: '#1e3a8a', color: 'white' }}>
                    <ul className="mobile-links" style={{ padding: '1rem' }}>
                        <li><a href="/" onClick={() => setIsMenuOpen(false)} style={{ color: 'white' }}>Home</a></li>
                        {categories.map((cat) => (
                            <li key={cat}>
                                <a href={`/?category=${cat}`} onClick={() => setIsMenuOpen(false)} style={{ color: 'white' }}>{cat}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </header>
    );
}
