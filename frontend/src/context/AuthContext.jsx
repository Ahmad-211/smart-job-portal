import { createContext, useState, useEffect, useCallback } from 'react';
import { getMe, loginUser, registerUser } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Load user on mount (if token exists)
    const loadUser = useCallback(async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await getMe();
            setUser(data.data.user);
            setToken(storedToken);
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Login
    const login = async (credentials) => {
        const { data } = await loginUser(credentials);
        const { user: userData, token: jwt } = data.data;
        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setToken(jwt);
        return userData;
    };

    // Register
    const register = async (formData) => {
        const { data } = await registerUser(formData);
        const { user: userData, token: jwt } = data.data;
        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setToken(jwt);
        return userData;
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        loadUser,
        isAuthenticated: !!token && !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
