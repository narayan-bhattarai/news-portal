import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Article } from '../data/mockData';
import Navbar from '../components/Navbar';
import './Admin.css';

export default function Admin() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Technology',
        author: 'Admin',
        imageUrl: '/images/tech-ev.png', // Default
        excerpt: '',
        content: '',
        isTrending: false
    });
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = () => {
        api.getArticles().then(setArticles);
    };

    const handleLogout = () => {
        api.logout();
        navigate('/login');
    };

    const handleEdit = (article: Article) => {
        setEditingId(article.id);
        setFormData({
            title: article.title,
            category: article.category,
            author: article.author,
            imageUrl: article.imageUrl,
            excerpt: article.excerpt,
            content: article.content || '',
            isTrending: article.isTrending || false
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            title: '',
            category: 'Technology',
            author: 'Admin',
            imageUrl: '/images/tech-ev.png', // Default
            excerpt: '',
            content: '',
            isTrending: false
        });
        setSelectedFile(null);
    };

    const handleDelete = async (id: string) => {
        // ... (unchanged)
        if (confirm('Are you sure you want to delete this article?')) {
            try {
                await api.deleteArticle(id);
                loadArticles();
            } catch (err) {
                alert('Failed to delete. You might need to login again.');
                api.logout();
                navigate('/login');
            }
        }
    };

    // ... (handleFileChange, handleSubmit unchanged in logic, just using expanded formData)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let finalImageUrl = formData.imageUrl;

            if (selectedFile) {
                setUploading(true);
                const result = await api.uploadImage(selectedFile);
                finalImageUrl = result.url;
                setUploading(false);
            }

            if (editingId) {
                await api.updateArticle(editingId, { ...formData, id: editingId, imageUrl: finalImageUrl });
                alert('Article updated successfully!');
            } else {
                await api.createArticle({ ...formData, imageUrl: finalImageUrl });
                alert('Article published successfully!');
            }

            handleCancelEdit(); // Reset form
            loadArticles();
        } catch (err) {
            setUploading(false);
            alert('Failed to save. ' + err);
        }
    };

    return (
        <div className="admin-page">
            <Navbar />
            <div className="container" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="admin-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Logout
                    </button>
                </div>

                <div className="admin-layout">
                    {/* Create/Edit Form */}
                    <div className="admin-panel">
                        {/* Title Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                            <h2 style={{ margin: 0, border: 'none', padding: 0 }}>{editingId ? 'Edit Article' : 'Add New Article'}</h2>
                            {editingId && (
                                <button onClick={handleCancelEdit} style={{ fontSize: '0.8rem', padding: '4px 8px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="admin-form">
                            {/* ... Title, Category, Image ... */}
                            <label>
                                Title
                                <input
                                    type="text"
                                    value={formData.title}
                                    required
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </label>

                            <label>
                                Category
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Technology</option>
                                    <option>Business</option>
                                    <option>World</option>
                                    <option>Sports</option>
                                    <option>Entertainment</option>
                                </select>
                            </label>

                            <label>
                                Article Image
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ border: 'none', padding: 0 }}
                                    />
                                    <small style={{ color: '#6b7280' }}>Or use external URL (if no file selected):</small>
                                    <input
                                        type="text"
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </label>

                            <label>
                                Excerpt
                                <textarea
                                    value={formData.excerpt}
                                    required
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    style={{ height: '80px' }}
                                />
                            </label>

                            <label>
                                Full Content
                                <textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    style={{ height: '200px' }}
                                    placeholder="Write the full article content here..."
                                />
                            </label>

                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.isTrending}
                                    onChange={e => setFormData({ ...formData, isTrending: e.target.checked })}
                                />
                                Is Trending?
                            </label>

                            <button
                                type="submit"
                                className="hero-btn"
                                disabled={uploading}
                                style={{ background: 'var(--color-accent)', color: 'white', opacity: uploading ? 0.7 : 1 }}
                            >
                                {uploading ? 'Uploading...' : (editingId ? 'Update Article' : 'Publish Article')}
                            </button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="admin-panel">
                        <h2>Manage Articles</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map(article => (
                                    <tr key={article.id}>
                                        <td>{article.title}</td>
                                        <td><span className="sc-tag">{article.category}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEdit(article)}
                                                    className="delete-btn"
                                                    style={{ background: '#dbeafe', color: '#2563eb' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="delete-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
