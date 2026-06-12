import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, LayoutDashboard, Upload, History,
  User, LogOut, ChevronDown, Zap, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ScoraLogo = ({ className = '' }) => (
  <Link to="/" className={`flex items-center gap-2 group ${className}`}>
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
      <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
    </div>
    <span className="font-bold text-lg tracking-tight text-white">
      Sco<span className="text-blue-400">ra</span>
    </span>
  </Link>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'History', path: '/history', icon: History },
  ];

  const avatarFallback = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#020817]/95 backdrop-blur-md border-b border-blue-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
          : 'bg-[#020817]/80 border-b border-blue-500/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <ScoraLogo />

            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ name, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive(path)
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} className={isActive(path) ? 'text-blue-400' : 'text-slate-500'} />
                    {name}
                  </Link>
                ))}
              </div>
            )}

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl border border-transparent hover:bg-white/5 hover:border-blue-500/20 transition-all duration-150"
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/40"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                        {avatarFallback}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-300 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0d1526] rounded-xl border border-blue-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] py-1 animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-blue-500/10">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        {[
                          { to: '/profile', icon: User, label: 'Profile' },
                          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                          { to: '/history', icon: FileText, label: 'My Resumes' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-blue-500/10 hover:text-white transition-colors"
                          >
                            <Icon size={15} className="text-slate-500" />
                            {label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-blue-500/10 pt-1 pb-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 w-full text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors shadow-glow-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5 transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-blue-500/10 bg-[#020817] animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 mb-2">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full ring-2 ring-blue-500/40" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {avatarFallback}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>

                  {navLinks.map(({ name, path, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(path)
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/20'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={16} className={isActive(path) ? 'text-blue-400' : 'text-slate-500'} />
                      {name}
                    </Link>
                  ))}

                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white">
                    <User size={16} className="text-slate-500" /> Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full mt-1"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2 py-2">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 border border-blue-500/20 hover:bg-white/5 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="h-16" />
    </>
  );
};

export default Navbar;
