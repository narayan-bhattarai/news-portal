import type { Article } from '../data/mockData';

const API_BASE_URL = 'http://localhost:5200/api'; // Standard .NET HTTP port

export const api = {
    getArticles: async (search?: string, category?: string): Promise<Article[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);

        const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch articles');
        return response.json();
    },

    getArticleById: async (id: string): Promise<Article> => {
        const response = await fetch(`${API_BASE_URL}/articles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch article');
        return response.json();
    },

    getTrending: async (): Promise<Article[]> => {
        const response = await fetch(`${API_BASE_URL}/articles/trending`);
        if (!response.ok) throw new Error('Failed to fetch trending news');
        return response.json();
    },

    getEditorsPicks: async (): Promise<Article[]> => {
        const response = await fetch(`${API_BASE_URL}/articles/editors-picks`);
        if (!response.ok) throw new Error('Failed to fetch editors picks');
        return response.json();
    },

    login: async (username: string, password: string): Promise<string> => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/articles`, {
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
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
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
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete article (Unauthorized?)');
    },

    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/uploads`, {
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

    sendContactMessage: async (data: { name: string; email: string; message: string }): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to send message');
    },

    getCategories: async (): Promise<{ id: number; name: string }[]> => {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    getPage: async (slug: string): Promise<{ slug: string; title: string; body: string }> => {
        const response = await fetch(`${API_BASE_URL}/pages/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch page content');
        return response.json();
    },

    updatePage: async (slug: string, content: { title: string; body: string }): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/pages/${slug}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ slug, ...content }),
        });
        if (!response.ok) throw new Error('Failed to update page');
    }
};
