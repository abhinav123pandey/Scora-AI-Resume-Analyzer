import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Editor from './pages/Editor';
import History from './pages/History';
import Profile from './pages/Profile';

// Protects pages that require login — redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Redirect already-logged-in users away from the login page
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        {/* Redirect old /signup to /login — we use Google auth now */}
        <Route path="/signup" element={<Navigate to="/login" replace />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute><Upload /></ProtectedRoute>
        } />
        <Route path="/analysis/:id" element={
          <ProtectedRoute><Analysis /></ProtectedRoute>
        } />
        <Route path="/editor/:id" element={
          <ProtectedRoute><Editor /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><History /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Toast notifications — top-right, auto-dismiss */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              background: '#0f172a',
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
