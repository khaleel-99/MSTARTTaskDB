import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);
    }, [language]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <ThemeContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, t }}>
            {children}
        </ThemeContext.Provider>
    );
};
