import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h1 style={{
                fontSize: '8rem',
                fontWeight: 900,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                lineHeight: 1
            }}>
                404
            </h1>
            <h2 style={{
                fontSize: '2rem',
                color: '#1e293b',
                marginTop: '1rem',
                marginBottom: '1rem',
                fontWeight: 700
            }}>
                Page Not Found
            </h2>
            <p style={{
                color: '#64748b',
                maxWidth: '500px',
                marginBottom: '2.5rem',
                fontSize: '1.1rem',
                lineHeight: 1.6
            }}>
                Oops! The page you are looking for seems to have wandered off into the digital void.
            </p>

            <div style={{ display: 'flex', gap: '16px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        color: '#475569',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <ArrowLeft size={18} /> Go Back
                </button>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 8px 16px rgba(59, 130, 246, 0.25)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 20px rgba(59, 130, 246, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.25)';
                    }}
                >
                    <Home size={18} /> Home
                </button>
            </div>
        </div>
    );
}
