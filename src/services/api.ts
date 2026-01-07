import { type Article, ARTICLES, TRENDING_NEWS, EDITORS_PICKS } from '../data/mockData';

import { config } from '../config';

// Environment Configuration
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const getApiUrl = (endpoint: string) => `${config.backendUrl}/api${endpoint}`;

// Mock Token Generator
const createMockToken = (username: string, role: string, fullName: string = '') => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ unique_name: username, role: role, fullName: fullName, exp: Math.floor(Date.now() / 1000) + 3600 }));
    const signature = "mockSignature";
    return `${header}.${payload}.${signature}`;
};

export const api = {
    isMock: USE_MOCK,
    getAssetUrl: (path: string) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        // Only prepend backend URL for /uploads/ which are served by backend
        if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
            return `${config.backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
        }
        return path;
    },
    getArticles: async (search?: string, category?: string): Promise<Article[]> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
            let articles = [...ARTICLES];
            if (category) {
                articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
            }
            if (search) {
                const lowerSearch = search.toLowerCase();
                articles = articles.filter(a =>
                    a.title.toLowerCase().includes(lowerSearch) ||
                    a.excerpt.toLowerCase().includes(lowerSearch)
                );
            }
            return articles;
        }

        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);

        const response = await fetch(getApiUrl(`/articles?${params.toString()}`));
        if (!response.ok) throw new Error('Failed to fetch articles');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    },

    getArticleById: async (id: string): Promise<Article> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const article = ARTICLES.find(a => a.id === id);
            if (!article) throw new Error('Article not found');
            return article;
        }

        const response = await fetch(getApiUrl(`/articles/${id}`));
        if (!response.ok) throw new Error('Failed to fetch article');
        return response.json();
    },

    getTrending: async (): Promise<Article[]> => {
        if (USE_MOCK) {
            return TRENDING_NEWS;
        }
        const response = await fetch(getApiUrl('/articles/trending'));
        if (!response.ok) throw new Error('Failed to fetch trending news');
        return response.json();
    },

    getEditorsPicks: async (): Promise<Article[]> => {
        if (USE_MOCK) {
            return EDITORS_PICKS;
        }
        const response = await fetch(getApiUrl('/articles/editors-picks'));
        if (!response.ok) throw new Error('Failed to fetch editors picks');
        return response.json();
    },

    login: async (username: string, password: string): Promise<string> => {
        if (USE_MOCK) {
            console.log(`[MockApi] Attempting login for: ${username}`);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Case-insensitive check for convenience
            if (username.toLowerCase() === 'admin' && password === 'admin123') {
                console.log('[MockApi] Login successful (Admin)');
                const token = createMockToken('admin', 'Admin', 'Narine Bhattarai');
                localStorage.removeItem('authToken'); // Clear any old data
                localStorage.setItem('authToken', token);
                return token;
            }
            if (username.toLowerCase() === 'user' && password === 'password') {
                console.log('[MockApi] Login successful (User)');
                const token = createMockToken('user', 'User');
                localStorage.removeItem('authToken');
                localStorage.setItem('authToken', token);
                return token;
            }
            console.warn('[MockApi] Login failed: Invalid credentials');
            throw new Error('Invalid credentials. Try: admin / admin123');
        }

        const response = await fetch(getApiUrl('/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error('Invalid credentials');

        const data = await response.json();
        const token = data.token;
        localStorage.setItem('authToken', token);
        return token;
    },

    logout: () => {
        localStorage.removeItem('authToken');
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('authToken');
    },

    createArticle: async (article: Omit<Article, 'id' | 'timeAgo'>): Promise<Article> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 600));
            const newArticle = {
                ...article,
                id: Math.random().toString(36).substr(2, 9),
                timeAgo: 'Just now'
            };
            ARTICLES.unshift(newArticle); // Update local mock cache (in memory only)
            return newArticle;
        }

        const token = localStorage.getItem('authToken');
        const response = await fetch(getApiUrl('/articles'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(article)
        });
        if (!response.ok) throw new Error('Failed to create article (Unauthorized?)');
        return response.json();
    },

    updateArticle: async (id: string, article: Omit<Article, 'timeAgo'>): Promise<void> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 600));
            return;
        }

        const token = localStorage.getItem('authToken');
        const response = await fetch(getApiUrl(`/articles/${id}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(article)
        });
        if (!response.ok) throw new Error('Failed to update article');
    },

    deleteArticle: async (id: string): Promise<void> => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 400));
            return;
        }
        const token = localStorage.getItem('authToken');
        const response = await fetch(getApiUrl(`/articles/${id}`), {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete article (Unauthorized?)');
    },

    uploadImage: async (file: File): Promise<string> => {
        if (USE_MOCK) {
            return URL.createObjectURL(file); // Local blob url for preview
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(getApiUrl('/uploads'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        return data.url;
    },

    sendContactMessage: async (data: { name: string; email: string; message: string; phone?: string }): Promise<void> => {
        if (USE_MOCK) {
            console.log("Mock contact message sent:", data);
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }
        const response = await fetch(getApiUrl('/contact'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to send message');
    },

    getCategories: async (): Promise<{ id: number; name: string }[]> => {
        if (USE_MOCK) {
            return [
                { id: 1, name: 'Technology' },
                { id: 2, name: 'Business' },
                { id: 3, name: 'World' },
                { id: 4, name: 'Sports' },
                { id: 5, name: 'Entertainment' }
            ];
        }
        const response = await fetch(getApiUrl('/categories'));
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    },

    createCategory: async (name: string): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl('/categories'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Failed to create category');
    },

    updateCategory: async (id: number, name: string): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl(`/categories/${id}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Failed to update category');
    },

    deleteCategory: async (id: number): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl(`/categories/${id}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Failed to delete category');
        }
    },

    getPage: async (slug: string): Promise<{ slug: string; title: string; body: string }> => {
        if (USE_MOCK) {
            return {
                slug,
                title: slug.charAt(0).toUpperCase() + slug.slice(1),
                body: `<h2>${slug}</h2><p>This is mock content for the ${slug} page.</p>`
            };
        }
        const response = await fetch(getApiUrl(`/pages/${slug}`));
        if (!response.ok) throw new Error('Failed to fetch page content');
        return response.json();
    },

    updatePage: async (slug: string, content: { title: string; body: string }): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl(`/pages/${slug}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ slug, ...content }),
        });
        if (!response.ok) throw new Error('Failed to update page');
    },

    getUsers: async (): Promise<any[]> => {
        if (USE_MOCK) {
            return [
                { id: 1, username: 'admin', role: 'Admin', email: 'admin@example.com' },
                { id: 2, username: 'editor', role: 'Editor', email: 'editor@example.com' }
            ];
        }
        const response = await fetch(getApiUrl('/users'), {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    createUser: async (user: any): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl('/auth/register'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('Failed to create user');
    },

    updatePublicKey: async (publicKey: string): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl('/users/key'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ publicKey })
        });
        if (!response.ok) throw new Error('Failed to update public key');
    },

    getUserKeys: async (): Promise<{ publicKey: string; privateKey: string }> => {
        if (USE_MOCK) return { publicKey: '', privateKey: '' };
        const response = await fetch(getApiUrl('/auth/keys'), {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) return { publicKey: '', privateKey: '' };
        return response.json();
    },

    updateUserKeys: async (keys: { publicKey: string; privateKey: string }): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl('/auth/keys'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(keys)
        });
        if (!response.ok) throw new Error('Failed to update user keys');
    },

    updateUser: async (id: number, user: any): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl(`/users/${id}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(user)
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Failed to update user');
        }
    },

    deleteUser: async (id: number): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl(`/users/${id}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to delete user');
    },

    getContactMessages: async (): Promise<any[]> => {
        if (USE_MOCK) return [];
        const response = await fetch(getApiUrl('/contact'), {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        return response.json();
    },

    deleteContactMessage: async (id: number): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl(`/contact/${id}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to delete message');
    },

    getChatHistory: async (): Promise<{ sender: string; receiver: string; content: string; timestamp: string; isRead: boolean }[]> => {
        if (USE_MOCK) {
            const stored = localStorage.getItem('mock_chat_history');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.warn('Failed to parse mock chat history, resetting.', e);
                    localStorage.removeItem('mock_chat_history');
                }
            }
            return [
                { sender: 'System', receiver: 'Admin', content: 'Welcome to the admin chat!', timestamp: new Date().toISOString(), isRead: true }
            ];
        }
        const response = await fetch(getApiUrl('/chat'), {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch chat history');
        return response.json();
    },

    deleteConversation: async (username: string): Promise<void> => {
        if (USE_MOCK) return;
        const response = await fetch(getApiUrl(`/chat/${username}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to delete conversation');
    },

    clearChatHistory: async (): Promise<void> => {
        if (USE_MOCK) {
            localStorage.removeItem('mock_chat_history');
            return;
        }
        const response = await fetch(getApiUrl('/chat'), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to clear chat history');
    },

    saveMockMessage: async (message: { sender: string; receiver: string; content: string; timestamp: string }) => {
        if (!USE_MOCK) return;
        const stored = localStorage.getItem('mock_chat_history');
        let history = [];
        try {
            history = stored ? JSON.parse(stored) : [];
        } catch (e) {
            history = [];
        }

        if (history.length === 0) {
            history.push({ sender: 'System', receiver: 'Admin', content: 'Welcome to the admin chat!', timestamp: new Date().toISOString() });
        }
        history.push(message);
        localStorage.setItem('mock_chat_history', JSON.stringify(history));
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            return {
                username: decoded.unique_name,
                role: decoded.role,
                fullName: decoded.fullName
            };
        } catch (e) {
            return null;
        }
    }
};
