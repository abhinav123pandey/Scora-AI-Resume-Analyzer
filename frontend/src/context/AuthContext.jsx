import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, getRedirectResult, signOutFromGoogle } from '../firebase';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // googleError is set here so Login.jsx can display it after a failed redirect
  const [googleError, setGoogleError] = useState('');

  // Check for a pending Google redirect result every time the app loads.
  // This must live in AuthContext (app root) — not in Login.jsx — because
  // Firebase stores the pending redirect in IndexedDB and it can only be
  // consumed once. If Login.jsx unmounts before the async call finishes,
  // the result is lost. AuthContext never unmounts.
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result?.user) return; // no pending redirect — normal page load

        const fb = result.user;
        const { data } = await api.post('/auth/google', {
          googleId: fb.uid,
          name: fb.displayName,
          email: fb.email,
          photoURL: fb.photoURL,
        });

        // Update state + localStorage — PublicRoute detects isAuthenticated=true
        // and navigates to /dashboard automatically, no manual navigate() needed
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
      } catch (err) {
        const code = err?.code || '';
        if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
          setGoogleError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
        }
      }
    };
    checkRedirectResult();
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const logout = async () => {
    try { await signOutFromGoogle(); } catch (_) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      googleError,
      clearGoogleError: () => setGoogleError(''),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
