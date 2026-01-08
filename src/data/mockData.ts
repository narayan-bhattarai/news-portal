export interface Article {
    id: number;
    category: string;
    title: string;
    excerpt: string;
    author: string;
    imageUrl: string;
    content?: string;
    isTrending?: boolean;
    publishedAt: string;
}

export const ARTICLES: Article[] = [
    {
        id: 1,
        category: 'Technology',
        title: 'The EV Revolution: New Solid-State Batteries Promise 1000km Range',
        excerpt: 'Major breakthroughs in battery technology are set to eliminate range anxiety and accelerate the transition to electric mobility.',
        author: 'Sarah Chen',
        imageUrl: '/images/tech-ev.png',
        isTrending: true,
        publishedAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2h ago
    },
    {
        id: 2,
        category: 'Business',
        title: 'Global Markets Rally as Inflation Shows Signs of Cooling',
        excerpt: 'Investors respond positively to the latest economic reports, driving indices to near-record highs across major exchanges.',
        author: 'James Wilson',
        imageUrl: '/images/business-market.png',
        isTrending: true,
        publishedAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4h ago
    },
    {
        id: 3,
        category: 'World',
        title: 'Historic Climate Accord Signed by 150 Nations',
        excerpt: 'World leaders unite to commit to aggressive carbon reduction targets in a landmark agreement.',
        author: 'Elena Rossi',
        imageUrl: '/images/world-climate.png',
        isTrending: false,
        publishedAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5h ago
    },
    {
        id: 4,
        category: 'Sports',
        title: 'Champions League Final: Night of Drama and Glory',
        excerpt: 'A stunning comeback in the final minutes secures the trophy in one of the most memorable matches in history.',
        author: 'Marcus Johnson',
        imageUrl: '/images/sports-soccer.png',
        isTrending: true,
        publishedAt: new Date(Date.now() - 3600000 * 6).toISOString() // 6h ago
    },
    {
        id: 5,
        category: 'Entertainment',
        title: 'Award Season 2025: Full List of Nominees',
        excerpt: 'Independent films dominate this year\'s nominations, signaling a shift in industry preferences.',
        author: 'Jessica Lee',
        imageUrl: '/images/tech-ev.png',
        isTrending: false,
        publishedAt: new Date(Date.now() - 3600000 * 8).toISOString() // 8h ago
    }
];

export const TRENDING_NEWS = ARTICLES.filter(a => a.isTrending);
export const EDITORS_PICKS = [ARTICLES[2], ARTICLES[0]]; // Demo
