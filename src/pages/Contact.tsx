import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            // Simulate API call or call actual API
            await api.sendContactMessage(formData);
            setStatus('success');
            setFormData({ name: '', email: '', message: '' }); // Reset form
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <Navbar />
            <div className="container" style={{ padding: '4rem 1rem', flex: 1, color: 'var(--color-text-primary)' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Contact Us</h1>
                    <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                        Have a question or feedback? We'd love to hear from you.
                    </p>

                    {status === 'success' ? (
                        <div style={{ padding: '2rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>Message Sent!</h3>
                            <p>Thank you for reaching out. We will get back to you shortly at {formData.email || 'your email'}.</p>
                            <button onClick={() => setStatus('idle')} style={{ marginTop: '1rem', background: 'none', border: '1px solid currentColor', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: 'inherit' }}>Send Another</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-surface)', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label htmlFor="name" style={{ fontWeight: 500 }}>Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
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
                                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
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
                                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontFamily: 'inherit', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
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
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    opacity: status === 'sending' ? 0.7 : 1,
                                    cursor: status === 'sending' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                            </button>

                            {status === 'error' && <p style={{ color: '#dc2626', textAlign: 'center' }}>Failed to send message. Please try again.</p>}
                        </form>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
