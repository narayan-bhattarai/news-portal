import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';

export default function About() {
    const [content, setContent] = useState({ title: 'About Us', body: 'Loading...' });

    useEffect(() => {
        api.getPage('about')
            .then(data => setContent(data))
            .catch(err => {
                console.error(err);
                setContent({
                    title: 'About Us',
                    body: "Welcome to Khabar Manch (News Platform), your dedicated source for impartial and timely news from around the globe. Established in 2025, our mission is to empower our readers with accurate information."
                });
            });
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <Navbar />
            <div className="container" style={{ padding: '4rem 1rem', flex: 1, color: 'var(--color-text-primary)' }}>
                <div style={{ maxWidth: '800px' }}>
                    <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>{content.title}</h1>
                    <div style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                        {content.body.split('\n').map((paragraph, index) => (
                            <p key={index} style={{ marginBottom: '1rem' }}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
