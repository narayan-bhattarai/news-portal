import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Article } from '../data/mockData';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import './ArticleDetail.css';

export default function ArticleDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            api.getArticleById(id)
                .then(setArticle)
                .catch(() => setError('Failed to load article'))
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner"></div>
        </div>
    );

    if (error || !article) return (
        <div className="error-screen">
            <h2>Article Not Found</h2>
            <button onClick={() => navigate('/')} className="back-btn">Go Home</button>
        </div>
    );

    return (
        <div className="article-page">
            <Navbar />

            <main className="container article-container">
                <button onClick={() => navigate(-1)} className="back-nav">
                    <ArrowLeft size={20} /> Back
                </button>

                <article className="full-article">
                    <header className="article-header">
                        <span className="article-category">{article.category}</span>
                        <h1 className="article-title">{article.title}</h1>

                        <div className="article-meta">
                            <div className="meta-item">
                                <User size={18} />
                                <span>{article.author}</span>
                            </div>
                            <div className="meta-item">
                                <Calendar size={18} />
                                <span>{article.timeAgo}</span>
                            </div>
                            <button className="share-btn">
                                <Share2 size={18} /> Share
                            </button>
                        </div>
                    </header>

                    <figure className="article-hero-image">
                        <img src={article.imageUrl} alt={article.title} />
                    </figure>

                    <div className="article-body">
                        <p className="lead-paragraph">{article.excerpt}</p>
                        {article.content && (
                            <div style={{ whiteSpace: 'pre-line', marginTop: '1.5rem' }}>
                                {article.content}
                            </div>
                        )}
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
