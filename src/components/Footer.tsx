import { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { config } from '../config';
import './Footer.css';

export default function Footer() {
    const navigate = useNavigate();
    const [contactInfo, setContactInfo] = useState({
        address: 'Kathmandu, Nepal',
        phone: '+977-1-4XXXXXX',
        email: 'info@khabarmancha.com',
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com',
        linkedin: 'https://linkedin.com'
    });

    const [categories, setCategories] = useState<string[]>([]);

    const [siteName] = useState(config.siteName);

    useEffect(() => {
        // Fetch Categories
        api.getCategories()
            .then((data: { name: string }[]) => setCategories(data.map(c => c.name)))
            .catch(() => { });

        api.getPage('contact-info')
            .then(data => {
                try {
                    const parsed = JSON.parse(data.body);
                    setContactInfo({
                        address: parsed.address || 'Kathmandu, Nepal',
                        phone: parsed.phone || '+977-1-4XXXXXX',
                        email: parsed.email || 'info@khabarmancha.com',
                        facebook: parsed.facebook || 'https://facebook.com',
                        twitter: parsed.twitter || 'https://twitter.com',
                        instagram: parsed.instagram || 'https://instagram.com',
                        linkedin: parsed.linkedin || 'https://linkedin.com'
                    });
                } catch (e) {
                    console.error("Failed to parse footer contact info", e);
                }
            })
            .catch(() => { });
    }, []);

    const renderLogo = () => {
        const parts = siteName.split(' ');
        const firstWord = parts[0];
        const rest = parts.slice(1).join(' ');

        return (
            <div className="footer-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <span>{firstWord}</span> {rest}
            </div>
        );
    };

    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        {renderLogo()}
                        <p className="footer-desc">
                            Your trusted source for the latest news, in-depth analysis, and diverse perspectives from around the globe.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h4>Categories</h4>
                        <ul>
                            {categories.map(cat => (
                                <li key={cat}>
                                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/?category=${cat}`); }}>
                                        {cat}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/careers">Careers</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                            <li><a href="/privacy-policy">Privacy Policy</a></li>
                            <li><a href="/terms-of-service">Terms of Service</a></li>
                        </ul>
                    </div>

                    <div className="footer-contact">
                        <h4>Contact Us</h4>
                        <p>{contactInfo.address}</p>
                        <p>Phone: {contactInfo.phone}</p>
                        <p>{contactInfo.email}</p>
                        <div className="social-icons">
                            {contactInfo.facebook && <a href={contactInfo.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={20} /></a>}
                            {contactInfo.twitter && <a href={contactInfo.twitter} target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={20} /></a>}
                            {contactInfo.instagram && <a href={contactInfo.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={20} /></a>}
                            {contactInfo.linkedin && <a href={contactInfo.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} खबर मञ्च. All rights reserved.</p>
            </div>
        </footer>
    );
}
