import type { Article } from '../data/mockData';

const API_BASE_URL = 'http://localhost:5200/api'; // Standard .NET HTTP port

export const api = {
    getArticles: async (): Promise<Article[]> => {
        const response = await fetch(`${API_BASE_URL}/articles`);
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

    uploadImage: async (file: File): Promise<{ url: string }> => {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/uploads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload image');
        return response.json();
    }
};
