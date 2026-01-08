import { Clock } from 'lucide-react';
import type { Article } from '../data/mockData';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/dateUtils';
import './NewsCard.css';

interface NewsCardProps {
    article: Article;
    compact?: boolean;
}

export default function NewsCard({ article, compact = false }: NewsCardProps) {
    return (
        <Link to={`/article/${article.id}`} className={`news-card ${compact ? 'compact' : ''}`}>
            <div className="news-card-image-wrapper">
                <img src={api.getAssetUrl(article.imageUrl)} alt={article.title} loading="lazy" />
                {!compact && <span className="news-card-category">{article.category}</span>}
            </div>
            <div className="news-card-content">
                <h3 className="news-card-title">{article.title}</h3>
                {!compact && <p className="news-card-excerpt">{article.excerpt}</p>}

                <div className="news-card-meta">
                    <span className="news-card-time">
                        <Clock size={14} /> {formatTimeAgo(article.publishedAt)}
                    </span>
                    {!compact && (
                        <span className="news-card-author">by {article.author}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
