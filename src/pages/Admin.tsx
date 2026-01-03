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
        isTrending: false
    });
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

    const handleDelete = async (id: string) => {
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

            await api.createArticle({ ...formData, imageUrl: finalImageUrl });

            setFormData({ ...formData, title: '', excerpt: '', imageUrl: '/images/tech-ev.png' }); // Reset form
            setSelectedFile(null);
            loadArticles();
            alert('Article published successfully!');
        } catch (err) {
            setUploading(false);
            alert('Failed to publish. ' + err);
            // api.logout(); // Don't logout immediately on upload fail, might be just a large file
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
                    {/* Create Form */}
                    <div className="admin-panel">
                        <h2>Add New Article</h2>
                        <form onSubmit={handleSubmit} className="admin-form">
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
                                {uploading ? 'Uploading...' : 'Publish Article'}
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
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="delete-btn"
                                            >
                                                Delete
                                            </button>
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
