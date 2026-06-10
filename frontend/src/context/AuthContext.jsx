import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from local storage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://pkmhelper-production.up.railway.app/api'}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    };

    const register = async (username, password, email, sdName) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://pkmhelper-production.up.railway.app/api'}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, sdName })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    };

    const updateUser = async (username, email, sdName) => {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, error: 'No token found' };

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://pkmhelper-production.up.railway.app/api'}/users/profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, email, sdName })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        updateUser,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
