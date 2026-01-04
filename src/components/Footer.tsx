import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}><span>खबर</span> मञ्च</div>
                        <p className="footer-desc">
                            Your trusted source for the latest news, in-depth analysis, and diverse perspectives from around the globe.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h4>Categories</h4>
                        <ul>
                            <li><a href="#">Technology</a></li>
                            <li><a href="#">Business</a></li>
                            <li><a href="#">World</a></li>
                            <li><a href="#">Sports</a></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/careers">Careers</a></li>
                            <li><a href="/contact">Contact Us</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                        </ul>
                    </div>

                    <div className="footer-contact">
                        <h4>Contact Us</h4>
                        <p>Kathmandu, Nepal</p>
                        <p>Phone: +977-1-4XXXXXX</p>
                        <p>Email: info@khabarmancha.com</p>
                        <div className="social-icons">
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 खबर मञ्च. All rights reserved.</p>
            </div>
        </footer>
    );
}
