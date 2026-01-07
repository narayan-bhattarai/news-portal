import { useState, useEffect } from 'react';
import { Trash2, Mail, Eye, X, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import '../../pages/Admin.css';

interface Message {
    id: number;
    submittedAt: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

    useEffect(() => {
        loadMessages();
    }, []);

    // Reset confirmation state when selected message changes
    useEffect(() => {
        setIsDeleteConfirming(false);
    }, [selectedMessage]);



    const loadMessages = () => {
        setLoading(true);
        api.getContactMessages()
            .then(data => {
                setMessages(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load messages:", err);
                setLoading(false);
            });
    };

    const handleDeleteMessage = async (id: number) => {
        // No browser confirm popup, use in-modal state instead
        try {
            await api.deleteContactMessage(id);
            setMessages(prev => prev.filter(m => m.id !== id));
            setSelectedMessage(null); // Close modal on success
        } catch (e) {
            console.error(e);
            alert('Failed to delete message');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="admin-content">
            <div className="content-card compact" style={{ maxWidth: '1000px' }}>
                <div className="card-header">
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Inbox</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Recent contact messages</p>
                    </div>
                    <div className="badge badge-primary">{messages.length} Messages</div>
                </div>

                <div className="table-responsive">
                    <table className="modern-table compact">
                        <thead>
                            <tr>
                                <th>Date Received</th>
                                <th>Sender Name</th>
                                <th>Email Address</th>
                                <th>Phone</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} className="text-center p-4">Loading messages...</td></tr>
                            ) : messages.length > 0 ? (
                                messages.map(m => (
                                    <tr key={m.id}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                                            {formatDate(m.submittedAt)}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{m.name}</div>
                                        </td>
                                        <td>
                                            <a href={`mailto:${m.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                {m.email}
                                            </a>
                                        </td>
                                        <td>
                                            <div style={{ color: 'var(--color-text-secondary)' }}>{m.phone || '-'}</div>
                                        </td>
                                        {/* Message column removed from grid */}
                                        <td>
                                            <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => setSelectedMessage(m)}
                                                    className="icon-btn edit"
                                                    title="View Full Message"
                                                    style={{ width: 'auto', padding: '0.4rem 1rem', gap: '6px', borderRadius: '6px' }}
                                                >
                                                    <Eye size={16} /> View
                                                </button>
                                                {/* Delete button removed from grid rows */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="empty-state">
                                        <Mail size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                        <div>No new messages</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '90%' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--color-primary-light, #e0e7ff)',
                                    color: 'var(--color-primary, #6366f1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Mail size={20} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Message Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="message-card">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div className="info-group">
                                    <label>Sender</label>
                                    <div className="info-value">{selectedMessage.name}</div>
                                </div>
                                <div className="info-group">
                                    <label>Received On</label>
                                    <div className="info-value">{formatDate(selectedMessage.submittedAt)}</div>
                                </div>
                            </div>

                            <div className="info-group" style={{ marginBottom: '20px' }}>
                                <label>Email Address</label>
                                <a href={`mailto:${selectedMessage.email}`} className="email-link">
                                    {selectedMessage.email}
                                </a>
                            </div>

                            <div className="info-group" style={{ marginBottom: '20px' }}>
                                <label>Phone</label>
                                <div className="info-value">{selectedMessage.phone || 'N/A'}</div>
                            </div>

                            <div className="info-group">
                                <label>Message Content</label>
                                <div className="message-body">
                                    {selectedMessage.message}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            {!isDeleteConfirming ? (
                                <>
                                    <button className="secondary-btn" onClick={() => setSelectedMessage(null)}>Close</button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => setIsDeleteConfirming(true)}
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </>
                            ) : (
                                <div className="delete-confirmation">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                                        <AlertTriangle size={18} />
                                        <span style={{ fontWeight: 500 }}>Delete this message permanently?</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="secondary-btn small" onClick={() => setIsDeleteConfirming(false)}>Cancel</button>
                                        <button
                                            className="primary-btn small danger"
                                            onClick={() => handleDeleteMessage(selectedMessage.id)}
                                        >
                                            Confirm Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                    animation: fadeIn 0.2s ease;
                }
                .modal-content {
                    background: var(--bg-primary, white);
                    padding: 0;
                    borderRadius: 16px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    animation: slideUp 0.3s ease;
                    color: var(--text-primary);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .modal-header {
                    padding: 1.5rem 1.5rem 1rem;
                    border-bottom: 1px solid var(--border-color, #e2e8f0);
                }
                .message-card {
                    padding: 1.5rem;
                    overflow-y: auto;
                    max-height: 60vh;
                }
                .info-group label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }
                .info-value {
                    font-weight: 500;
                    font-size: 1rem;
                    color: var(--text-primary);
                }
                .email-link {
                    color: var(--color-primary, #6366f1);
                    text-decoration: none;
                    font-weight: 500;
                }
                .email-link:hover { text-decoration: underline; }
                .message-body {
                    background: var(--bg-secondary, #f8fafc);
                    padding: 1.25rem;
                    borderRadius: 8px;
                    white-space: pre-wrap;
                    line-height: 1.6;
                    color: var(--text-primary);
                    border: 1px solid var(--border-color, #e2e8f0);
                }
                .modal-footer {
                    padding: 1rem 1.5rem;
                    background: var(--bg-secondary, #f8fafc);
                    border-top: 1px solid var(--border-color, #e2e8f0);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    min-height: 72px; /* Prevent layout shift when switching buttons */
                    align-items: center;
                }
                .delete-btn {
                    background-color: transparent;
                    border: 1px solid #fee2e2;
                    color: #ef4444;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .delete-btn:hover {
                    background-color: #fef2f2;
                    border-color: #ef4444;
                }
                .delete-confirmation {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }
                .secondary-btn.small { padding: 0.4rem 0.8rem; font-size: 0.9em; }
                .primary-btn.small { padding: 0.4rem 0.8rem; font-size: 0.9em; }
                .primary-btn.danger { background-color: #ef4444; }
                .primary-btn.danger:hover { background-color: #dc2626; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                /* Dark Mode Overrides */
                :root[data-theme="dark"] .modal-content {
                    background: #1f2937;
                    color: #f3f4f6;
                }
                :root[data-theme="dark"] .modal-header {
                    border-bottom-color: #374151;
                }
                :root[data-theme="dark"] .message-body {
                    background: #111827;
                    border-color: #374151;
                    color: #e2e8f0;
                }
                :root[data-theme="dark"] .modal-footer {
                    background: #1f2937;
                    border-top-color: #374151;
                }
                :root[data-theme="dark"] .delete-btn {
                    border-color: rgba(239, 68, 68, 0.4);
                }
                :root[data-theme="dark"] .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                }
                :root[data-theme="dark"] .secondary-btn {
                    background: #374151;
                    border-color: #4b5563;
                    color: #e2e8f0;
                }
                :root[data-theme="dark"] .secondary-btn:hover {
                    background: #4b5563;
                }
            `}</style>
        </div>
    );
}
