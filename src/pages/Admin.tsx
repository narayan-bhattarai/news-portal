import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Article } from '../data/mockData';
import {
    LayoutDashboard,
    FileText,
    List,
    Layers,
    LogOut,
    Settings,
    Plus,
    Edit,
    Trash2,
    Image as ImageIcon,
    Save
} from 'lucide-react';
import './Admin.css';

export default function Admin() {
    const navigate = useNavigate();
    const handleLogout = () => {
        api.logout();
        navigate('/login');
    };

    const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'pages'>('articles');

    // --- Article State ---
    const [articles, setArticles] = useState<Article[]>([]);
    const [articleForm, setArticleForm] = useState({
        title: '',
        category: 'Technology',
        author: 'Admin',
        imageUrl: '',
        excerpt: '',
        content: '',
        isTrending: false
    });
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showArticleForm, setShowArticleForm] = useState(false);

    // --- Category State ---
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    // --- Page State ---
    const [pageSlug, setPageSlug] = useState('about');
    const [pageContent, setPageContent] = useState({ title: '', body: '' });

    // --- Effects ---
    useEffect(() => {
        if (activeTab === 'articles') loadArticles();
        if (activeTab === 'categories') loadCategories();
        if (activeTab === 'pages') loadPage(pageSlug);
        loadCategories(); // Always load categories for the dropdown
    }, [activeTab, pageSlug]);

    const loadArticles = () => api.getArticles().then(setArticles);

    // ... (Keeping existing handlers layout slightly cleaner)
    const handleArticleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
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
                await api.updateArticle(editingId, { ...articleForm, id: editingId, imageUrl: finalImageUrl });
                alert('Article updated successfully!');
            } else {
                await api.createArticle({ ...articleForm, imageUrl: finalImageUrl });
                alert('Article published successfully!');
            }
            handleCancelEdit();
            loadArticles();
            setShowArticleForm(false);
        } catch (err) {
            setUploading(false);
            alert('Failed to save article.');
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
            isTrending: article.isTrending
        });
        setShowArticleForm(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setArticleForm({
            title: '', category: 'Technology', author: 'Admin', imageUrl: '', excerpt: '', content: '', isTrending: false
        });
        setSelectedFile(null);
        setShowArticleForm(false);
    };

    const handleDeleteArticle = async (id: string) => {
        if (confirm('Delete this article?')) {
            try {
                await api.deleteArticle(id);
                loadArticles();
            } catch { alert('Failed to delete.'); }
        }
    };

    const loadCategories = () => {
        api.getCategories().then(setCategories).catch(console.error);
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5200/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (res.ok) {
                setNewCategoryName('');
                loadCategories();
            } else {
                alert('Failed to add category');
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteCategory = async (id: number) => {
        if (confirm('Delete category?')) {
            await fetch(`http://localhost:5200/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            loadCategories();
        }
    };

    const loadPage = (slug: string) => {
        api.getPage(slug)
            .then(data => setPageContent({ title: data.title, body: data.body }))
            .catch(() => setPageContent({ title: '', body: '' }));
    };

    const handleSavePage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.updatePage(pageSlug, pageContent);
            alert('Page content updated!');
        } catch { alert('Failed to update page.'); }
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-logo" onClick={() => navigate('/')}>
                    <span>खबर</span> मञ्च
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={activeTab === 'articles' ? 'active' : ''}
                        onClick={() => setActiveTab('articles')}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button
                        className={activeTab === 'categories' ? 'active' : ''}
                        onClick={() => setActiveTab('categories')}
                    >
                        <List size={20} /> Categories
                    </button>
                    <button
                        className={activeTab === 'pages' ? 'active' : ''}
                        onClick={() => setActiveTab('pages')}
                    >
                        <Layers size={20} /> Pages
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h2>
                        {activeTab === 'articles' && 'Article Management'}
                        {activeTab === 'categories' && 'Category Management'}
                        {activeTab === 'pages' && 'Page Content'}
                    </h2>
                    <div className="user-profile">
                        <div className="avatar">A</div>
                        <span>Admin User</span>
                    </div>
                </header>

                <div className="admin-content">
                    {/* --- ARTICLES TAB --- */}
                    {activeTab === 'articles' && (
                        <>
                            {!showArticleForm ? (
                                <div className="content-card">
                                    <div className="card-header">
                                        <h3>All Articles</h3>
                                        <button className="primary-btn" onClick={() => setShowArticleForm(true)}>
                                            <Plus size={18} /> New Article
                                        </button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Category</th>
                                                    <th>Author</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {articles.map(a => (
                                                    <tr key={a.id}>
                                                        <td>{a.title}</td>
                                                        <td><span className="badge">{a.category}</span></td>
                                                        <td>{a.author}</td>
                                                        <td><span className={`status-dot ${a.isTrending ? 'trending' : ''}`}></span> {a.isTrending ? 'Trending' : 'Standard'}</td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button onClick={() => handleEditArticle(a)} className="icon-btn edit" title="Edit"><Edit size={18} /></button>
                                                                <button onClick={() => handleDeleteArticle(a.id)} className="icon-btn delete" title="Delete"><Trash2 size={18} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {articles.length === 0 && <tr><td colSpan={5} className="empty-state">No articles found.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="content-card">
                                    <div className="card-header">
                                        <h3>{editingId ? 'Edit Article' : 'Create New Article'}</h3>
                                        <button className="secondary-btn" onClick={handleCancelEdit}>Cancel</button>
                                    </div>
                                    <form onSubmit={handleArticleSubmit} className="modern-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Title</label>
                                                <input value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} required placeholder="Enter article title" />
                                            </div>
                                            <div className="form-group">
                                                <label>Category</label>
                                                <select value={articleForm.category} onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}>
                                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                    {categories.length === 0 && <option>Technology</option>}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Excerpt</label>
                                            <textarea value={articleForm.excerpt} onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })} rows={3} placeholder="Short summary..." required />
                                        </div>

                                        <div className="form-group">
                                            <label>Full Content (HTML Supported)</label>
                                            <textarea value={articleForm.content} onChange={e => setArticleForm({ ...articleForm, content: e.target.value })} rows={10} placeholder="Article body..." />
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group file-group">
                                                <label>Featured Image</label>
                                                <div className="file-input-wrapper">
                                                    <input type="file" id="file-upload" onChange={handleArticleFileChange} hidden />
                                                    <label htmlFor="file-upload" className="file-label">
                                                        <ImageIcon size={18} /> {selectedFile ? selectedFile.name : "Choose File"}
                                                    </label>
                                                    <input type="text" placeholder="Or Image URL..." value={articleForm.imageUrl} onChange={e => setArticleForm({ ...articleForm, imageUrl: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="form-group checkbox-group">
                                                <label>Status</label>
                                                <label className="checkbox-option">
                                                    <input type="checkbox" checked={articleForm.isTrending} onChange={e => setArticleForm({ ...articleForm, isTrending: e.target.checked })} />
                                                    <span>Mark as Trending News</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="form-actions">
                                            <button type="submit" className="primary-btn" disabled={uploading}>
                                                {uploading ? 'Processing...' : <><Save size={18} /> {editingId ? 'Update Article' : 'Publish Article'}</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}

                    {/* --- CATEGORIES TAB --- */}
                    {activeTab === 'categories' && (
                        <div className="content-grid">
                            <div className="content-card">
                                <h3>Add New Category</h3>
                                <form onSubmit={handleAddCategory} className="modern-form inline-form">
                                    <input
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        placeholder="Category Name"
                                        required
                                    />
                                    <button type="submit" className="primary-btn"><Plus size={18} /> Add</button>
                                </form>
                            </div>
                            <div className="content-card">
                                <h3>Existing Categories</h3>
                                <ul className="category-list">
                                    {categories.map(c => (
                                        <li key={c.id}>
                                            <span>{c.name}</span>
                                            <button onClick={() => handleDeleteCategory(c.id)} className="icon-btn delete"><Trash2 size={16} /></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* --- PAGES TAB --- */}
                    {activeTab === 'pages' && (
                        <div className="content-card">
                            <div className="card-header">
                                <h3>Edit Page Content</h3>
                                <div className="select-wrapper">
                                    <select value={pageSlug} onChange={e => setPageSlug(e.target.value)} className="page-select">
                                        <option value="about">About Us</option>
                                        <option value="careers">Careers</option>
                                        <option value="contact-info">Contact</option>
                                    </select>
                                </div>
                            </div>
                            <form onSubmit={handleSavePage} className="modern-form">
                                <div className="form-group">
                                    <label>Page Title</label>
                                    <input value={pageContent.title} onChange={e => setPageContent({ ...pageContent, title: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Body Content</label>
                                    <textarea
                                        value={pageContent.body}
                                        onChange={e => setPageContent({ ...pageContent, body: e.target.value })}
                                        rows={15}
                                        className="code-editor"
                                    />
                                </div>
                                <button type="submit" className="primary-btn"><Save size={18} /> Save Changes</button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
