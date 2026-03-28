import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Krijo Kontekstin
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Vendos token-in si gjendje fillestare te axios për kërkesat
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Mund të bëjmë një kërkesë te "/api/auth/me" këtu për të marrë profilin nëse rifreskohet faqja
            // Për tani po e marrim me hamendje nga LocalStorage (Mund t'i shtojmë një fushë në të ardhmen)
            const storedUser = localStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            const { token, user } = response.data;
            
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Ndodhi një gabim gjatë identifikimit!" };
        }
    };

    const register = async (fullName, email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', { fullName, email, password });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Ndodhi një gabim gjatë regjistrimit!" };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
