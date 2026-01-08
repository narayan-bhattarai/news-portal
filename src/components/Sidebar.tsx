import { useState, useEffect } from 'react';
import './Sidebar.css';
import type { Article } from '../data/mockData';
import NewsCard from './NewsCard';
import { api } from '../services/api';
import { formatTimeAgo } from '../utils/dateUtils';

export default function Sidebar() {
    const [trending, setTrending] = useState<Article[]>([]);
    const [editorsPicks, setEditorsPicks] = useState<Article[]>([]);

    useEffect(() => {
        Promise.all([api.getTrending(), api.getEditorsPicks()])
            .then(([trendingData, picksData]) => {
                setTrending(trendingData);
                setEditorsPicks(picksData);
            })
            .catch(err => console.error("Failed to load sidebar data", err));
    }, []);

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <h3 className="sidebar-title">Trending News</h3>
                <div className="trending-list">
                    {trending.map((article, index) => (
                        <div key={article.id} className="trending-item">
                            <span className="trending-number">{index + 1}</span>
                            <div className="trending-content">
                                <h4 className="trending-title">{article.title}</h4>
                                <div className="trending-meta">{formatTimeAgo(article.publishedAt)} • {article.category}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sidebar-section">
                <h3 className="sidebar-title">Editor's Picks</h3>
                <div className="editors-picks-list">
                    {editorsPicks.map((article) => (
                        <NewsCard key={article.id} article={article} compact={true} />
                    ))}
                </div>
            </div>
        </aside>
    );
}
