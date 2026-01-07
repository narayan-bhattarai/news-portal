import { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { api } from '../services/api';

export default function Careers() {
    const [pageContent, setPageContent] = useState({ title: 'Join Our Team', body: '' });

    useEffect(() => {
        api.getPage('careers')
            .then(data => setPageContent({ title: data.title || 'Join Our Team', body: data.body || '' }))
            .catch(() => { });
    }, []);

    return (
        <div className="container" style={{ padding: '4rem 1rem', color: 'var(--color-text-primary)' }}>
            <div style={{ maxWidth: '800px' }}>
                <h1 style={{ fontFamily: 'var(--font-family-serif)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>{pageContent.title}</h1>

                {pageContent.body ? (
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div dangerouslySetInnerHTML={{ __html: pageContent.body }} />
                    </div>
                ) : (
                    <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <Briefcase size={48} style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }} />
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Openings Currently</h2>
                        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                            We are currently fully staffed and not accepting new applications.
                            However, we are always on the lookout for exceptional talent.
                            Please check back later or follow us on social media for future updates.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
