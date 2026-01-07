import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Hero.css';

interface HeroProps {
    id?: string | number;
    category?: string;
    title?: string;
    summary?: string;
    imageUrl?: string;
}

export default function Hero({
    id,
    title = "The Future of AI: How Machine Learning is Transforming Industries",
    summary = "From healthcare to finance, artificial intelligence is reshaping the global landscape. Discover the latest breakthroughs and what they mean for the future of work.",
    imageUrl = "/images/hero-ai.jpg"
}: HeroProps) {
    const navigate = useNavigate();

    return (
        <div className="hero" style={{ backgroundImage: `url(${api.getAssetUrl(imageUrl)})` }}>
            <div className="hero-overlay"></div>
            <div className="container hero-container">
                <div className="hero-content">
                    <span className="hero-category">Featured Story</span>
                    <h1 className="hero-title">{title}</h1>
                    <p className="hero-summary">{summary}</p>
                    {id && (
                        <button onClick={() => navigate(`/article/${id}`)} className="hero-btn">
                            Read More <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
