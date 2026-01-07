import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Save, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Snackbar from '../../components/ui/Snackbar';
import '../../pages/Admin.css';

export default function AdminPages() {
    const [pageSlug, setPageSlug] = useState('about');


    // Generic Page Content
    const [pageContent, setPageContent] = useState({ title: '', body: '' });

    // Contact Specific Content
    const [contactDetails, setContactDetails] = useState({
        address: '',
        phone: '',
        email: '',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
    });

    // Snackbar State
    const [snackbar, setSnackbar] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        isOpen: false,
        message: '',
        type: 'info'
    });

    const showSnackbar = (message: string, type: 'success' | 'error' | 'info') => {
        setSnackbar({ isOpen: true, message, type });
    };

    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        loadPage(pageSlug);
    }, [pageSlug]);

    const loadPage = (slug: string) => {
        api.getPage(slug)
            .then(data => {
                if (slug === 'contact-info') {
                    try {
                        const parsed = JSON.parse(data.body);
                        setPageContent({ title: data.title, body: parsed.body || '' });
                        setContactDetails({
                            address: parsed.address || '',
                            phone: parsed.phone || '',
                            email: parsed.email || '',
                            facebook: parsed.facebook || '',
                            twitter: parsed.twitter || '',
                            instagram: parsed.instagram || '',
                            linkedin: parsed.linkedin || ''
                        });
                    } catch (e) {
                        // Legacy: it wasn't JSON yet
                        setPageContent({ title: data.title, body: data.body });
                        setContactDetails({ address: '', phone: '', email: '', facebook: '', twitter: '', instagram: '', linkedin: '' });
                    }
                } else {
                    setPageContent({ title: data.title, body: data.body });
                }
            })
            .catch(() => {
                setPageContent({ title: '', body: '' });
            });
    };

    const handleSavePage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let contentToSave: any = pageContent;

            if (pageSlug === 'contact-info') {
                // Serialize contact details into Body
                const jsonBody = JSON.stringify({
                    body: pageContent.body,
                    ...contactDetails
                });
                contentToSave = { ...pageContent, body: jsonBody };
            }

            await api.updatePage(pageSlug, contentToSave);
            showSnackbar('Page content updated successfully!', 'success');
        } catch {
            showSnackbar('Failed to update page.', 'error');
        }
    };

    return (
        <div className="admin-content">
            <div className="content-card admin-pages-content compact" style={{ maxWidth: '900px' }}>
                <div className="card-header">
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Edit Page Content</h3>
                    </div>
                    <div className="select-wrapper">
                        <select value={pageSlug} onChange={e => setPageSlug(e.target.value)} className="page-select">
                            <option value="about">About Us</option>
                            <option value="careers">Careers</option>
                            <option value="contact-info">Contact</option>
                            <option value="privacy-policy">Privacy Policy</option>
                            <option value="terms-of-service">Terms of Service</option>
                        </select>
                    </div>
                </div>
                <form onSubmit={handleSavePage} className="modern-form">
                    <div className="form-group">
                        <label>Page Title</label>
                        <input
                            value={pageContent.title}
                            onChange={e => setPageContent({ ...pageContent, title: e.target.value })}
                            placeholder="Enter page title"
                        />
                    </div>

                    {pageSlug !== 'settings' && (
                        <div className="form-group">
                            <label>Intro Content (HTML)</label>
                            <textarea
                                value={pageContent.body}
                                onChange={e => setPageContent({ ...pageContent, body: e.target.value })}
                                rows={pageSlug === 'contact-info' ? 5 : 12}
                                className="code-editor"
                                placeholder="<div>Content goes here...</div>"
                                style={{ resize: 'vertical', minHeight: pageSlug === 'contact-info' ? '120px' : '300px' }}
                            />
                        </div>
                    )}

                    {pageSlug === 'contact-info' && (
                        <>
                            <div className="compact-section" style={{ marginTop: '0.5rem' }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Details</h4>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem' }}><MapPin size={12} /> Address</label>
                                        <input
                                            value={contactDetails.address}
                                            onChange={e => setContactDetails({ ...contactDetails, address: e.target.value })}
                                            placeholder="City, Country"
                                            style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem' }}><Phone size={12} /> Phone</label>
                                        <input
                                            value={contactDetails.phone}
                                            onChange={e => setContactDetails({ ...contactDetails, phone: e.target.value })}
                                            placeholder="+977-..."
                                            style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem' }}><Mail size={12} /> Email</label>
                                        <input
                                            value={contactDetails.email}
                                            onChange={e => setContactDetails({ ...contactDetails, email: e.target.value })}
                                            placeholder="info@example.com"
                                            style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="compact-section" style={{ marginTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Social Links</h4>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem' }}><Facebook size={12} /> Facebook</label>
                                        <input
                                            value={contactDetails.facebook}
                                            onChange={e => setContactDetails({ ...contactDetails, facebook: e.target.value })}
                                            placeholder="URL"
                                            style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem' }}><Twitter size={12} /> Twitter</label>
                                        <input
                                            value={contactDetails.twitter}
                                            onChange={e => setContactDetails({ ...contactDetails, twitter: e.target.value })}
                                            placeholder="URL"
                                            style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem' }}><Instagram size={12} /> Instagram</label>
                                        <input
                                            value={contactDetails.instagram}
                                            onChange={e => setContactDetails({ ...contactDetails, instagram: e.target.value })}
                                            placeholder="URL"
                                            style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.75rem' }}><Linkedin size={12} /> LinkedIn</label>
                                        <input
                                            value={contactDetails.linkedin}
                                            onChange={e => setContactDetails({ ...contactDetails, linkedin: e.target.value })}
                                            placeholder="URL"
                                            style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-actions" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                        <button type="submit" className="primary-btn"><Save size={18} /> Save Changes</button>
                    </div>
                </form>
            </div>

            <Snackbar
                isOpen={snackbar.isOpen}
                message={snackbar.message}
                type={snackbar.type}
                onClose={closeSnackbar}
            />

            <style>{`
                .form-group label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }

                .admin-pages-content {
                    overflow-y: auto;
                    max-height: calc(100vh - 200px); /* Adjusted for better visibility */
                    padding-right: 8px;
                    padding-bottom: 3rem; /* Increased bottom padding */
                }
            `}</style>
        </div>
    );
}
