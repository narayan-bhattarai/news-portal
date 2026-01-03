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
                        {/* Simulation of full content since we only have excerpt in DB for now */}
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p>
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                        <h3>Analyzing the Impact</h3>
                        <p>
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                        </p>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
