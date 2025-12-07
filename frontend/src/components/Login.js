import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import styles from './Login.module.css';

function Login({ onLoginSuccess }) {
    const { t } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(email, password);
            console.log('Login successful:', response);
            onLoginSuccess(response);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <h2 className={styles.loginTitle}>{t('welcomeBack')}</h2>
                <p className={styles.loginSubtitle}>{t('signInSubtitle')}</p>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                            placeholder={t('email')}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>{t('password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                            placeholder={t('password')}
                        />
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? t('signingIn') : t('signIn')}
                    </button>
                </form>
                <div className={styles.testCredentials}>
                    <p><strong>{t('testCredentials')}:</strong></p>
                    <p>🔑 <strong>{t('admin')}:</strong> admin@example.com / Admin123!</p>
                    <p>👤 <strong>{t('user')}:</strong> user@example.com / User123!</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
