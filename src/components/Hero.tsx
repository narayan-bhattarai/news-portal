import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

interface HeroProps {
    category?: string;
    title?: string;
    summary?: string;
    imageUrl?: string;
}

export default function Hero({
    title = "The Future of AI: How Machine Learning is Transforming Industries",
    summary = "From healthcare to finance, artificial intelligence is reshaping the global landscape. Discover the latest breakthroughs and what they mean for the future of work.",
    imageUrl = "/images/hero-ai.jpg"
}: HeroProps) {
    const navigate = useNavigate();
    // Default ID for hero - ideally passed in props or fetched
    const heroId = "hero-1";

    return (
        <div className="hero" style={{ backgroundImage: `url(${imageUrl})` }}>
            <div className="hero-overlay"></div>
            <div className="container hero-container">
                <div className="hero-content">
                    <span className="hero-category">Featured Story</span>
                    <h1 className="hero-title">{title}</h1>
                    <p className="hero-summary">{summary}</p>
                    <button onClick={() => navigate(`/article/${heroId}`)} className="hero-btn">
                        Read More <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
