import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface GenericPageProps {
    slug: string;
    defaultTitle?: string;
}

export default function GenericPage({ slug, defaultTitle }: GenericPageProps) {
    const [pageContent, setPageContent] = useState({ title: defaultTitle || '', body: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getPage(slug)
            .then(data => {
                setPageContent({ title: data.title || defaultTitle || 'Page', body: data.body || '' });
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [slug, defaultTitle]);

    return (
        <div className="container" style={{ padding: '4rem 1rem', color: 'var(--color-text-primary)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                ) : (
                    <>
                        <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>{pageContent.title}</h1>
                        <div
                            style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)', lineHeight: '1.8' }}
                            dangerouslySetInnerHTML={{ __html: pageContent.body || '<p>Content coming soon.</p>' }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
