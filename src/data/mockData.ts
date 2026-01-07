export interface Article {
    id: string;
    category: string;
    title: string;
    excerpt: string;
    author: string;
    timeAgo: string;
    imageUrl: string;
    content?: string;
    isTrending?: boolean;
    publishedAt?: string;
}

export const ARTICLES: Article[] = [
    {
        id: '1',
        category: 'Technology',
        title: 'The EV Revolution: New Solid-State Batteries Promise 1000km Range',
        excerpt: 'Major breakthroughs in battery technology are set to eliminate range anxiety and accelerate the transition to electric mobility.',
        author: 'Sarah Chen',
        timeAgo: '2h ago',
        imageUrl: '/images/tech-ev.png',
        isTrending: true
    },
    {
        id: '2',
        category: 'Business',
        title: 'Global Markets Rally as Inflation Shows Signs of Cooling',
        excerpt: 'Investors respond positively to the latest economic reports, driving indices to near-record highs across major exchanges.',
        author: 'James Wilson',
        timeAgo: '4h ago',
        imageUrl: '/images/business-market.png',
        isTrending: true
    },
    {
        id: '3',
        category: 'World',
        title: 'Historic Climate Accord Signed by 150 Nations',
        excerpt: 'World leaders unite to commit to aggressive carbon reduction targets in a landmark agreement.',
        author: 'Elena Rossi',
        timeAgo: '5h ago',
        imageUrl: '/images/world-climate.png',
        isTrending: false
    },
    {
        id: '4',
        category: 'Sports',
        title: 'Champions League Final: Night of Drama and Glory',
        excerpt: 'A stunning comeback in the final minutes secures the trophy in one of the most memorable matches in history.',
        author: 'Marcus Johnson',
        timeAgo: '6h ago',
        imageUrl: '/images/sports-soccer.png',
        isTrending: true
    },
    {
        id: '5',
        category: 'Entertainment',
        title: 'Award Season 2025: Full List of Nominees',
        excerpt: 'Independent films dominate this year\'s nominations, signaling a shift in industry preferences.',
        author: 'Jessica Lee',
        timeAgo: '8h ago',
        imageUrl: '/images/tech-ev.png', // Reusing for demo if needed or fallback
        isTrending: false
    }
];

export const TRENDING_NEWS = ARTICLES.filter(a => a.isTrending);
export const EDITORS_PICKS = [ARTICLES[2], ARTICLES[0]]; // Demo
