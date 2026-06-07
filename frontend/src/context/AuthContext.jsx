import React, { createContext, useContext, useState } from 'react';
import { signOutFromGoogle } from '../firebase';

// This context stores auth state globally so every component can access it
// without prop drilling. It's the single source of truth for "who is logged in".
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so login persists across page refreshes
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Called after successful Google auth — stores user data everywhere
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  // Clears everything and signs out from Firebase
  const logout = async () => {
    try {
      await signOutFromGoogle();
    } catch (e) {
      // ignore firebase errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — cleaner than calling useContext(AuthContext) everywhere
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
