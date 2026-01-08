import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { Article } from '../../data/mockData';
import { Plus, Edit, Trash2, Save, Image as ImageIcon, X } from 'lucide-react';
import '../../pages/Admin.css'; // We'll keep sharing standard styles or refactor later

import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Snackbar from '../../components/ui/Snackbar';
import Editor from 'react-simple-wysiwyg';
import { formatTimeAgo } from '../../utils/dateUtils';

export default function AdminDashboard() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [showArticleForm, setShowArticleForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [deleteTargetTitle, setDeleteTargetTitle] = useState<string>('');

    // Form State
    const [articleForm, setArticleForm] = useState({
        title: '',
        category: 'Technology',
        author: (() => {
            const u = api.getCurrentUser();
            if (u?.fullName) return u.fullName;
            if (u?.username) return u.username.charAt(0).toUpperCase() + u.username.slice(1);
            return 'Admin';
        })(),
        imageUrl: '',
        excerpt: '',
        content: '',
        isTrending: false
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

    // Categories for dropdown
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        loadArticles();
        loadCategories();
    }, []);

    const loadArticles = () => {
        api.getArticles()
            .then(setArticles)
            .catch(err => {
                console.error("Failed to load articles:", err);
                setArticles([]);
            });
    };

    const loadCategories = () => {
        api.getCategories().then(setCategories).catch(console.error);
    };

    const handleArticleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleEditArticle = (article: Article) => {
        setEditingId(article.id);
        setArticleForm({
            title: article.title,
            category: article.category,
            author: article.author,
            imageUrl: article.imageUrl,
            excerpt: article.excerpt,
            content: article.content || '',
            isTrending: !!article.isTrending
        });
        setPreviewUrl(article.imageUrl);
        setShowArticleForm(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        const currentUser = api.getCurrentUser();
        const defaultAuthor = currentUser?.fullName || (currentUser?.username ? currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1) : 'Admin');
        setArticleForm({
            title: '', category: 'Technology', author: defaultAuthor, imageUrl: '', excerpt: '', content: '', isTrending: false
        });
        setSelectedFile(null);
        setPreviewUrl('');
        setShowArticleForm(false);
    };

    const initiateDelete = (id: number, title: string) => {
        setDeleteTargetId(id);
        setDeleteTargetTitle(title);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteArticle = async () => {
        if (deleteTargetId) {
            try {
                await api.deleteArticle(deleteTargetId);
                loadArticles();
                showSnackbar('Article deleted successfully.', 'success');
            } catch { showSnackbar('Failed to delete.', 'error'); }
            setDeleteTargetId(null);
        }
    };

    const handleArticleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let finalImageUrl = articleForm.imageUrl || '/images/default-news.png';
            if (selectedFile) {
                setUploading(true);
                finalImageUrl = await api.uploadImage(selectedFile);
                setUploading(false);
            }

            if (editingId) {
                const existing = articles.find(a => a.id === editingId);
                await api.updateArticle(editingId, {
                    ...articleForm,
                    id: editingId,
                    imageUrl: finalImageUrl,
                    publishedAt: existing?.publishedAt || new Date().toISOString()
                });
                showSnackbar('Article updated successfully!', 'success');
            } else {
                await api.createArticle({
                    ...articleForm,
                    imageUrl: finalImageUrl,
                    publishedAt: new Date().toISOString()
                });
                showSnackbar('Article published successfully!', 'success');
            }
            handleCancelEdit();
            loadArticles();
        } catch (err) {
            setUploading(false);
            showSnackbar('Failed to save article.', 'error');
        }
    };

    return (
        <div className="admin-content">
            {!showArticleForm ? (
                <div className="content-card" style={{ padding: '1.25rem', maxWidth: '1200px' }}>
                    <div className="card-header" style={{ marginBottom: '1rem', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Article Management</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{articles.length} total articles</p>
                        </div>
                        <button className="primary-btn compact" onClick={() => setShowArticleForm(true)}>
                            <Plus size={16} /> New Article
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="modern-table compact">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>#</th>
                                    <th>Title</th>
                                    <th style={{ width: '110px' }}>Category</th>
                                    <th style={{ width: '200px' }}>Published</th>
                                    <th style={{ width: '120px' }}>Author</th>
                                    <th style={{ width: '110px' }}>Status</th>
                                    <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles?.length > 0 ? (
                                    articles.map((a, index) => (
                                        <tr key={a.id}>
                                            <td style={{ color: 'var(--text-muted)' }}>{index + 1}.</td>
                                            <td>
                                                <div className="truncate-cell" title={a.title} style={{ fontWeight: 500 }}>
                                                    {a.title}
                                                </div>
                                            </td>
                                            <td><span className="badge badge-gray">{a.category}</span></td>
                                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                {a.publishedAt ? formatTimeAgo(a.publishedAt) : 'N/A'}
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>{a.author}</td>
                                            <td>
                                                {a.isTrending ? (
                                                    <span className="badge badge-red">Trending</span>
                                                ) : (
                                                    <span className="badge badge-blue">Standard</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleEditArticle(a)} className="icon-btn edit" title="Edit"><Edit size={16} /></button>
                                                    <button onClick={() => initiateDelete(a.id, a.title)} className="icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={7} className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No articles found. Start by creating one.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="content-card article-form-card">
                    <div className="card-header">
                        <h3>{editingId ? 'Edit Article' : 'Create New Article'}</h3>
                    </div>
                    <form onSubmit={handleArticleSubmit} className="modern-form">
                        <div className="form-grid">
                            <div className="form-group span-2">
                                <label>Title</label>
                                <input value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} required placeholder="Enter article title" />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select value={articleForm.category} onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}>
                                    {categories?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    {(!categories || categories.length === 0) && <option>Technology</option>}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Author</label>
                                <input
                                    value={articleForm.author}
                                    onChange={e => setArticleForm({ ...articleForm, author: e.target.value })}
                                    placeholder="Author Name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Excerpt</label>
                                <textarea value={articleForm.excerpt} onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })} rows={3} placeholder="Short summary..." required style={{ resize: 'vertical' }} />
                            </div>

                            <div className="form-group span-2">
                                <label>Full Content</label>
                                <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                                    <Editor
                                        value={articleForm.content}
                                        onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                                        containerProps={{ style: { minHeight: '300px' } }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Featured Image</label>
                                <div className="file-input-wrapper">
                                    <input type="file" id="file-upload" onChange={handleArticleFileChange} accept="image/*" hidden />
                                    <label htmlFor="file-upload" className="file-label">
                                        <ImageIcon size={18} /> Choose File
                                    </label>
                                    <span className="file-name">{selectedFile ? selectedFile.name : "No file selected"}</span>
                                </div>
                                {previewUrl && (
                                    <div className="image-preview">
                                        <img src={api.getAssetUrl(previewUrl)} alt="Preview" />
                                        <button type="button" onClick={() => { setPreviewUrl(''); setSelectedFile(null); setArticleForm({ ...articleForm, imageUrl: '' }) }} className="remove-image"><X size={14} /></button>
                                    </div>
                                )}
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-option">
                                    <input type="checkbox" checked={articleForm.isTrending} onChange={e => setArticleForm({ ...articleForm, isTrending: e.target.checked })} />
                                    <span>Mark as Trending News</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="secondary-btn" onClick={handleCancelEdit}>Cancel</button>
                            <button type="submit" className="primary-btn" disabled={uploading}>
                                {uploading ? 'Processing...' : <><Save size={18} /> {editingId ? 'Update Article' : 'Publish Article'}</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <Snackbar
                isOpen={snackbar.isOpen}
                message={snackbar.message}
                type={snackbar.type}
                onClose={closeSnackbar}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteArticle}
                title="Delete Article"
                message={`Are you sure you want to delete "${deleteTargetTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
            />

            <style>{`
                .article-form-card {
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    max-height: calc(100vh - 160px);
                    gap: 0;
                }
                .article-form-card .card-header {
                    padding: 1.25rem 2rem;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--surface-white);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                :root[data-theme="dark"] .article-form-card .card-header {
                    background: #1a2333;
                    border-color: #334155;
                }
                .article-form-card .modern-form {
                    padding: 2rem;
                    overflow-y: auto;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .modern-form label {
                    color: var(--text-dark);
                    font-weight: 600;
                }
                :root[data-theme="dark"] .modern-form label {
                    color: #f1f5f9;
                }
                .article-form-card .form-actions {
                    padding: 1.25rem 2rem;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    background: #f8fafc;
                }
                :root[data-theme="dark"] .article-form-card .form-actions {
                    background: #1a2333;
                    border-color: #334155;
                }
                /* Editor Dark Mode */
                :root[data-theme="dark"] .rsw-editor {
                    background: #1e293b !important;
                    border-color: #334155 !important;
                    color: white !important;
                }
                :root[data-theme="dark"] .rsw-toolbar {
                    background: #334155 !important;
                    border-bottom-color: #475569 !important;
                }
                :root[data-theme="dark"] .rsw-btn {
                    color: #cbd5e1 !important;
                }
                :root[data-theme="dark"] .rsw-btn:hover {
                    background: #475569 !important;
                    color: white !important;
                }
                .article-form-card .card-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                }
                .image-preview {
                    margin: 0.5rem 0;
                    border-radius: 12px;
                    position: relative;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                    border: 1px solid var(--border-color);
                    background: var(--bg-light);
                    width: fit-content;
                }
                .image-preview img {
                    display: block;
                    max-width: 100%;
                    max-height: 200px;
                    object-fit: contain;
                    border-radius: 12px;
                }
                .remove-image {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: #ef4444;
                    color: white;
                    border: 2px solid white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 5;
                    transition: transform 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .remove-image:hover {
                    transform: scale(1.1);
                    background: #dc2626;
                }
                .checkbox-group {
                    padding: 0.75rem 0;
                }
            `}</style>
        </div>
    );
}
