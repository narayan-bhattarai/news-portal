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
            <div className="content-card admin-pages-content">
                <div className="card-header">
                    <div>
                        <h3 className="section-title">Edit Page Content</h3>
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
                            className="title-input"
                        />
                    </div>

                    {pageSlug !== 'settings' && (
                        <div className="form-group">
                            <label>Intro Content (HTML)</label>
                            <textarea
                                value={pageContent.body}
                                onChange={e => setPageContent({ ...pageContent, body: e.target.value })}
                                rows={pageSlug === 'contact-info' ? 8 : 20}
                                className="code-editor"
                                placeholder="<div>Content goes here...</div>"
                            />
                        </div>
                    )}

                    {pageSlug === 'contact-info' && (
                        <div className="contact-info-grid">
                            <div className="compact-section">
                                <h4>Contact Details</h4>
                                <div className="form-row-grid">
                                    <div className="form-group">
                                        <label><MapPin size={16} /> Address</label>
                                        <input
                                            value={contactDetails.address}
                                            onChange={e => setContactDetails({ ...contactDetails, address: e.target.value })}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Phone size={16} /> Phone</label>
                                        <input
                                            value={contactDetails.phone}
                                            onChange={e => setContactDetails({ ...contactDetails, phone: e.target.value })}
                                            placeholder="+977-..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Mail size={16} /> Email</label>
                                        <input
                                            value={contactDetails.email}
                                            onChange={e => setContactDetails({ ...contactDetails, email: e.target.value })}
                                            placeholder="info@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="compact-section" style={{ marginTop: '2rem' }}>
                                <h4>Social Links</h4>
                                <div className="form-row-grid">
                                    <div className="form-group">
                                        <label><Facebook size={16} /> Facebook</label>
                                        <input
                                            value={contactDetails.facebook}
                                            onChange={e => setContactDetails({ ...contactDetails, facebook: e.target.value })}
                                            placeholder="URL"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Twitter size={16} /> Twitter</label>
                                        <input
                                            value={contactDetails.twitter}
                                            onChange={e => setContactDetails({ ...contactDetails, twitter: e.target.value })}
                                            placeholder="URL"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Instagram size={16} /> Instagram</label>
                                        <input
                                            value={contactDetails.instagram}
                                            onChange={e => setContactDetails({ ...contactDetails, instagram: e.target.value })}
                                            placeholder="URL"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label><Linkedin size={16} /> LinkedIn</label>
                                        <input
                                            value={contactDetails.linkedin}
                                            onChange={e => setContactDetails({ ...contactDetails, linkedin: e.target.value })}
                                            placeholder="URL"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
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
                .admin-pages-content {
                    padding-bottom: 4rem;
                }

                .admin-pages-content.content-card {
                    max-width: 1200px !important;
                    width: 100%;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                    margin-left: auto;
                    margin-right: auto;
                }

                .section-title {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-dark);
                }

                :root[data-theme="dark"] .section-title {
                    color: white;
                }

                .form-row-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1rem;
                }

                .title-input {
                    font-size: 1.2rem !important;
                    font-weight: 600;
                    padding: 1rem !important;
                }

                .form-group label {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--text-muted);
                }

                :root[data-theme="dark"] .form-group label {
                    color: #94a3b8;
                }

                .compact-section h4 {
                    font-weight: 700;
                    border-bottom: 2px solid var(--border-color);
                    padding-bottom: 12px;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    color: var(--primary-color);
                    text-transform: uppercase;
                    font-size: 0.85rem;
                    letter-spacing: 0.05em;
                }

                :root[data-theme="dark"] .compact-section h4 {
                    border-color: #334155;
                }

                .code-editor {
                    min-height: 500px !important;
                    font-family: 'Fira Code', 'Cascadia Code', 'Source Code Pro', monospace !important;
                    line-height: 1.6;
                    tab-size: 4;
                }

                :root[data-theme="dark"] .code-editor {
                    background-color: #0f172a !important;
                    color: #7dd3fc !important;
                    border-color: #334155 !important;
                }

                .form-actions {
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: flex-end;
                }

                :root[data-theme="dark"] .form-actions {
                    border-color: #334155;
                }
            `}</style>
        </div>
    );
}
