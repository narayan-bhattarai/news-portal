import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [pageData, setPageData] = useState<any>({
        title: 'Contact Us',
        body: 'Have a question or feedback? We\'d love to hear from you.',
        address: 'Kathmandu, Nepal',
        phone: '+977-1-4XXXXXX',
        email: 'info@khabarmancha.com',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
    });

    useEffect(() => {
        api.getPage('contact-info')
            .then(data => {
                try {
                    // Try to parse if it's JSON (new format)
                    const parsed = JSON.parse(data.body);
                    setPageData({
                        title: data.title,
                        body: parsed.body || '',
                        address: parsed.address || 'Kathmandu, Nepal',
                        phone: parsed.phone || '+977-1-4XXXXXX',
                        email: parsed.email || 'info@khabarmancha.com',
                        facebook: parsed.facebook || '',
                        twitter: parsed.twitter || '',
                        instagram: parsed.instagram || '',
                        linkedin: parsed.linkedin || ''
                    });
                } catch (e) {
                    // Fallback for plain HTML (legacy)
                    setPageData(prev => ({ ...prev, title: data.title, body: data.body }));
                }
            })
            .catch(err => console.error("Failed to load contact info", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            await api.sendContactMessage(formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', color: 'var(--color-text-primary)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>

                {/* Left Column: Contact Info */}
                <div className="contact-info-section">
                    <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>{pageData.title}</h1>
                    <div dangerouslySetInnerHTML={{ __html: pageData.body }} style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {pageData.address && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MapPin size={20} color="var(--color-primary)" />
                                <span>{pageData.address}</span>
                            </div>
                        )}
                        {pageData.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Phone size={20} color="var(--color-primary)" />
                                <span>{pageData.phone}</span>
                            </div>
                        )}
                        {pageData.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Mail size={20} color="var(--color-primary)" />
                                <a href={`mailto:${pageData.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{pageData.email}</a>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        {pageData.facebook && <a href={pageData.facebook} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-secondary)' }}><Facebook size={24} /></a>}
                        {pageData.twitter && <a href={pageData.twitter} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-secondary)' }}><Twitter size={24} /></a>}
                        {pageData.instagram && <a href={pageData.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-secondary)' }}><Instagram size={24} /></a>}
                        {pageData.linkedin && <a href={pageData.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-secondary)' }}><Linkedin size={24} /></a>}
                    </div>
                </div>

                {/* Right Column: Contact Form */}
                <div>
                    {status === 'success' ? (
                        <div style={{ padding: '2rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>Message Sent!</h3>
                            <p>Thank you for reaching out. We will get back to you shortly.</p>
                            <button onClick={() => setStatus('idle')} style={{ marginTop: '1rem', background: 'none', border: '1px solid currentColor', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: 'inherit' }}>Send Another</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Send us a Message</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label htmlFor="name" style={{ fontWeight: 500 }}>Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label htmlFor="email" style={{ fontWeight: 500 }}>Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label htmlFor="phone" style={{ fontWeight: 500 }}>Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label htmlFor="message" style={{ fontWeight: 500 }}>Message</label>
                                <textarea
                                    id="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: 'var(--color-accent)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    opacity: status === 'sending' ? 0.7 : 1,
                                    cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                            </button>

                            {status === 'error' && <p style={{ color: '#dc2626', textAlign: 'center' }}>Failed to send message. Please try again.</p>}
                        </form>
                    )}
                </div>
            </div>
            <style>{`
                @media (max-width: 768px) {
                    .container > div {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
