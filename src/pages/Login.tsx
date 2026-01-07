import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = localStorage.getItem('theme') || 'light';
    const logoSrc = theme === 'dark' ? '/everestedit_dark.png' : '/everestedit.png';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        console.log('Login form submitted for:', username);

        try {
            await api.login(username, password);
            console.log('Login API returned success. Navigating to /admin...');
            navigate('/admin');
        } catch (err: any) {
            console.error('Login error caught in component:', err);
            const msg = err.message || 'Login failed';
            setError(msg);
            alert(`Login Error: ${msg}`); // Explicit alert for user
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-box">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <img src={logoSrc} alt="Logo" style={{ height: '100px', width: 'auto' }} />
                    </div>
                    <h2>Admin Login</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-btn">Login</button>
                    </form>

                </div>
            </div>
        </div>
    );
}
