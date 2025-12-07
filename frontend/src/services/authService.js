import api from './api';

export const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.username);
                localStorage.setItem('role', response.data.role);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
    },

    getCurrentUser: () => {
        return {
            token: localStorage.getItem('token'),
            username: localStorage.getItem('username'),
            role: localStorage.getItem('role'),
        };
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};
