import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Article } from '../data/mockData';
import {
    LayoutDashboard,
    List,
    Layers,
    LogOut,
    Settings,
    Plus,
    Edit,
    Trash2,
    Image as ImageIcon,
    Save,
    MessageSquare
} from 'lucide-react';
import './Admin.css';

export default function Admin() {
    const navigate = useNavigate();
    const handleLogout = () => {
        api.logout();
        navigate('/login');
    };

    const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'pages' | 'users' | 'messages'>('articles');

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
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showArticleForm, setShowArticleForm] = useState(false);

    // --- Category State ---
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    // --- Page State ---
    const [pageSlug, setPageSlug] = useState('about');
    const [pageContent, setPageContent] = useState({ title: '', body: '' });

    // --- User State ---
    const [users, setUsers] = useState<{ id: number; username: string; role: string; createdAt: string }[]>([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', confirmPassword: '' });
    const [editingUser, setEditingUser] = useState<{ id: number; username: string; role: string } | null>(null);
    const [editUserForm, setEditUserForm] = useState({ username: '', role: 'Editor', newPassword: '', confirmPassword: '' });

    // --- Message State ---
    const [messages, setMessages] = useState<any[]>([]);

    // --- Actions ---
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

    const loadPage = (slug: string) => {
        api.getPage(slug)
            .then(data => setPageContent({ title: data.title, body: data.body }))
            .catch(() => setPageContent({ title: '', body: '' }));
    };

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (e) { console.error(e); }
    };

    // --- Effects ---
    useEffect(() => {
        if (activeTab === 'articles') loadArticles();
        if (activeTab === 'categories') loadCategories();
        if (activeTab === 'pages') loadPage(pageSlug);
        if (activeTab === 'users') loadUsers();
        if (activeTab === 'messages') api.getContactMessages().then(setMessages).catch(console.error);
        loadCategories();
    }, [activeTab, pageSlug]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newUser.password !== newUser.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            await api.createUser({ username: newUser.username, password: newUser.password, role: 'Editor' });
            alert('User created!');
            setNewUser({ username: '', password: '', confirmPassword: '' });
            loadUsers();
        } catch (e) {
            console.error(e);
            alert('Failed to create user');
        }
    };

    const startEditingUser = (user: any) => {
        setEditingUser(user);
        setEditUserForm({ username: user.username, role: user.role, newPassword: '', confirmPassword: '' });
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editUserForm.newPassword && editUserForm.newPassword !== editUserForm.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (!editingUser) return;

        try {
            await api.updateUser(editingUser.id, {
                username: editUserForm.username,
                role: editUserForm.role,
                newPassword: editUserForm.newPassword
            });
            alert('User updated!');
            setEditingUser(null);
            loadUsers();
        } catch (e) { alert('Failed to update user'); }
    };

    const handleDeleteMessage = async (id: number) => {
        if (confirm('Delete message?')) {
            try {
                await api.deleteContactMessage(id);
                setMessages(prev => prev.filter(m => m.id !== id));
            } catch (e) { console.error(e); }
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Delete user?')) return;
        try {
            await api.deleteUser(id);
            loadUsers();
        } catch (e) { console.error(e); }
    };

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
                await api.updateArticle(editingId, {
                    ...articleForm,
                    id: editingId,
                    imageUrl: finalImageUrl,
                    publishedAt: new Date().toISOString() // Ensure required field is present
                });
                alert('Article updated successfully!');
            } else {
                await api.createArticle({
                    ...articleForm,
                    imageUrl: finalImageUrl,
                    publishedAt: new Date().toISOString() // Ensure required field is present
                });
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
            isTrending: article.isTrending ?? false
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

    const handleDeleteArticle = async (id: number) => {
        if (confirm('Delete this article?')) {
            try {
                await api.deleteArticle(id);
                loadArticles();
            } catch { alert('Failed to delete.'); }
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createCategory(newCategoryName);
            setNewCategoryName('');
            loadCategories();
        } catch (e) {
            console.error(e);
            alert('Failed to add category');
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (confirm('Delete category?')) {
            try {
                await api.deleteCategory(id);
                loadCategories();
            } catch (e) { console.error(e); }
        }
    };

    const handleSavePage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.updatePage(pageSlug, pageContent);
            alert('Page content updated!');
        } catch { alert('Failed to update page.'); }
    };

    // --- Theme State ---
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo" onClick={() => navigate('/')}>
                    <span>खबर</span> मञ्च
                </div>

                <nav className="sidebar-nav">
                    <button className={activeTab === 'articles' ? 'active' : ''} onClick={() => setActiveTab('articles')}>
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
                        <List size={20} /> Categories
                    </button>
                    <button className={activeTab === 'pages' ? 'active' : ''} onClick={() => setActiveTab('pages')}>
                        <Layers size={20} /> Pages
                    </button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <Settings size={20} /> Users
                    </button>
                    <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
                        <MessageSquare size={20} /> Messages
                    </button>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h2>
                        {activeTab === 'articles' && 'Article Management'}
                        {activeTab === 'categories' && 'Category Management'}
                        {activeTab === 'pages' && 'Page Content'}
                        {activeTab === 'users' && 'User Management'}
                        {activeTab === 'messages' && 'Contact Messages'}
                    </h2>
                    <div className="header-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                        </button>
                        <div className="user-profile-container">
                            <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                                <div className="avatar">A</div>
                                <span>Admin User</span>
                            </div>
                            {isProfileOpen && (
                                <div className="profile-dropdown">
                                    <button onClick={handleLogout} className="dropdown-item logout">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
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
                                                {articles?.length > 0 ? (
                                                    articles.map(a => (
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
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={5} className="empty-state">No articles found.</td></tr>
                                                )}
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
                                                    {categories?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                    {(!categories || categories.length === 0) && <option>Technology</option>}
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
                                    {categories?.map(c => (
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

                    {/* --- USERS TAB --- */}
                    {activeTab === 'users' && (
                        <div className="content-grid">
                            <div className="content-card">
                                <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
                                {!editingUser ? (
                                    <form onSubmit={handleCreateUser} className="modern-form">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input
                                                value={newUser.username}
                                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                                placeholder="Enter username"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                value={newUser.password}
                                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                placeholder="Enter password"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm Password</label>
                                            <input
                                                type="password"
                                                value={newUser.confirmPassword}
                                                onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                                                placeholder="Confirm password"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="primary-btn"><Plus size={18} /> Create User</button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleUpdateUser} className="modern-form">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input
                                                value={editUserForm.username}
                                                onChange={e => setEditUserForm({ ...editUserForm, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Role</label>
                                            <select value={editUserForm.role} onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value })}>
                                                <option value="Editor">Editor</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                        <hr style={{ margin: '1rem 0', borderColor: 'var(--color-border)' }} />
                                        <div className="form-group">
                                            <label>Reset Password (Optional)</label>
                                            <input
                                                type="password"
                                                value={editUserForm.newPassword}
                                                onChange={e => setEditUserForm({ ...editUserForm, newPassword: e.target.value })}
                                                placeholder="New Password"
                                            />
                                        </div>
                                        {editUserForm.newPassword && (
                                            <div className="form-group">
                                                <label>Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={editUserForm.confirmPassword}
                                                    onChange={e => setEditUserForm({ ...editUserForm, confirmPassword: e.target.value })}
                                                    placeholder="Confirm new password"
                                                    required
                                                />
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button type="submit" className="primary-btn"><Save size={18} /> Update User</button>
                                            <button type="button" className="secondary-btn" onClick={() => setEditingUser(null)}>Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            <div className="content-card">
                                <h3>System Users</h3>
                                <div className="table-responsive">
                                    <table className="modern-table">
                                        <thead>
                                            <tr>
                                                <th>Username</th>
                                                <th>Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users?.length > 0 ? (
                                                users.map(u => (
                                                    <tr key={u.id}>
                                                        <td>{u.username}</td>
                                                        <td><span className={`badge ${u.role === 'Admin' ? 'badge-primary' : 'badge-secondary'}`}>{u.role}</span></td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button onClick={() => startEditingUser(u)} className="icon-btn edit" title="Edit"><Edit size={16} /></button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(u.id)}
                                                                    className="icon-btn delete"
                                                                    title="Delete"
                                                                    disabled={u.username === 'admin'}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={3} className="empty-state">No users found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- MESSAGES TAB --- */}
                    {activeTab === 'messages' && (
                        <div className="content-card">
                            <h3>Contact Messages</h3>
                            <div className="table-responsive">
                                <table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Message</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {messages?.length > 0 ? (
                                            messages.map(m => (
                                                <tr key={m.id}>
                                                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(m.submittedAt).toLocaleDateString()}</td>
                                                    <td>{m.name}</td>
                                                    <td>{m.email}</td>
                                                    <td style={{ maxWidth: '300px' }}>{m.message}</td>
                                                    <td>
                                                        <button onClick={() => handleDeleteMessage(m.id)} className="icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={5} className="empty-state">No messages found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
