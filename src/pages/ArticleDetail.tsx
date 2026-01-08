import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Article } from '../data/mockData';
import { api } from '../services/api';
import { ArrowLeft, Share2 } from 'lucide-react';
import './ArticleDetail.css';

export default function ArticleDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateStr, setDateStr] = useState('');
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        if (id) {
            api.getArticleById(parseInt(id, 10))
                .then(data => {
                    setArticle(data);
                    let dateToUse = new Date();
                    if (data.publishedAt) {
                        dateToUse = new Date(data.publishedAt);
                    }

                    // English Format
                    const dStr = dateToUse.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    // Time 12h format manual
                    let hours = dateToUse.getHours();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    const minutes = dateToUse.getMinutes().toString().padStart(2, '0');
                    const tStr = `${hours}:${minutes} ${ampm}`;

                    setDateStr(dStr);
                    setTimeStr(tStr);
                })
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
            <main className="container article-container">
                <button onClick={() => navigate(-1)} className="back-nav">
                    <ArrowLeft size={20} /> Back
                </button>

                <article className="full-article">
                    <header className="article-header">
                        <span className="article-category">{article.category}</span>
                        <h1 className="article-title">{article.title}</h1>
                        <p className="lead-paragraph" style={{ marginBottom: '1rem' }}>{article.excerpt}</p>

                        <div className="article-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '10px 0', marginTop: '10px' }}>
                            <span style={{ fontWeight: 500 }}>{dateStr}</span>
                            <span style={{ color: 'var(--color-text-secondary)' }}>|</span>
                            <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{article.author}</span>

                            <div style={{ marginLeft: 'auto' }}>
                                <button className="share-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-text-secondary)' }}>
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </header>

                    <figure className="article-hero-image">
                        <img src={api.getAssetUrl(article.imageUrl)} alt={article.title} />
                    </figure>

                    <div className="article-body">
                        {article.content && (
                            <div
                                style={{ marginTop: '1.5rem', lineHeight: '1.8' }}
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        )}

                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '30px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            Published : {dateStr} {timeStr}
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
