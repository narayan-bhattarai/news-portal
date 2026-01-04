import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';
import type { Article } from '../data/mockData';
import { api } from '../services/api';
import '../styles/Home.css';

import { useSearchParams } from 'react-router-dom';

export default function Home() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const categoryQuery = searchParams.get('category') || '';

    useEffect(() => {
        setLoading(true);
        api.getArticles(searchQuery, categoryQuery)
            .then(data => setArticles(data))
            .catch(err => {
                console.error(err);
                setError(`Failed to load news: ${err.message}. Is the backend running?`);
            })
            .finally(() => setLoading(false));
    }, [searchQuery, categoryQuery]);

    return (
        <div className="home-page">
            <Navbar />
            <Hero />

            <main className="container home-layout">
                <section className="news-feed">
                    <h2 className="section-header">
                        {searchQuery ? `Search Results: "${searchQuery}"` :
                            categoryQuery ? `${categoryQuery} News` :
                                'Latest News'}
                    </h2>
                    <div className="news-grid">
                        {error ? (
                            <div style={{ padding: '2rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>
                                <h3>Error Loading News</h3>
                                <p>{error}</p>
                                <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Retry</button>
                            </div>
                        ) : loading ? (
                            <p>Loading news...</p>
                        ) : (
                            articles.map((article) => (
                                <NewsCard key={article.id} article={article} />
                            ))
                        )}
                    </div>
                </section>

                <Sidebar />
            </main>

            <Footer />
        </div>
    );
}
