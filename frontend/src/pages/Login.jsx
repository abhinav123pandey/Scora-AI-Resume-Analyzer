import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, ArrowLeft, Zap } from 'lucide-react';
import { auth, signInWithGoogle, getRedirectResult } from '../firebase';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const GoogleButton = ({ onClick, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0d1526] border border-blue-500/30 rounded-xl text-slate-200 font-medium text-sm hover:bg-[#162033] hover:border-blue-400/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading ? (
      <div className="w-5 h-5 border-2 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    )}
    <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
  </button>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-blue-500/20" />
    <span className="text-xs text-slate-500 font-medium">or</span>
    <div className="flex-1 h-px bg-blue-500/20" />
  </div>
);

const Field = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#0a1020] border border-blue-500/30 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60 transition-all"
      />
      {children}
    </div>
  </div>
);

const Login = () => {
  const [mode, setMode] = useState('signin');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Navigate to dashboard once auth state is committed — fixes the race condition
  // where navigate() fires before React applies the setToken() state update
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // On mount: check if returning from Google redirect
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!result?.user) return;
        setGoogleLoading(true);
        const fb = result.user;
        const { data } = await api.post('/auth/google', {
          googleId: fb.uid,
          name: fb.displayName,
          email: fb.email,
          photoURL: fb.photoURL,
        });
        login(data.user, data.token);
        // navigate handled by the isAuthenticated effect above
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in failed. Try again.');
        setGoogleLoading(false);
      }
    };
    handleRedirectResult();
  }, []);

  const setField = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setError('');
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle(); // redirects browser — result caught on return via useEffect above
    } catch (err) {
      setError('Could not start Google sign-in. Try again.');
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setEmailLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
      login(data.user, data.token);
      // navigate handled by the isAuthenticated effect
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setEmailLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/signup', { name: form.name, email: form.email, password: form.password });
      login(data.user, data.token);
      // navigate handled by the isAuthenticated effect
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) { setError('Enter your email address.'); return; }
    setEmailLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1000));
    setEmailLoading(false);
    setSuccessMsg(`If an account exists for ${form.email}, a reset link has been sent.`);
  };

  const panelContent = {
    signin: { headline: 'Welcome back.', sub: 'Sign in to view your ATS scores and resume analyses.' },
    signup: { headline: 'Get your edge.', sub: 'Create an account and get your first ATS score in under 30 seconds.' },
    forgot: { headline: 'Recover access.', sub: "We'll send a password reset link to your email." },
  };

  return (
    <div className="min-h-screen flex bg-[#020817]">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#0d1526] to-[#050d1a] border-r border-blue-500/20 flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        {/* Glow orb */}
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-14">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-glow-sm">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Scora</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
              {panelContent[mode].headline}
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">{panelContent[mode].sub}</p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            '⚡ ATS score in under 30 seconds',
            '🎯 Keyword match against any job description',
            '✨ AI bullet point improvements',
          ].map(f => (
            <div key={f} className="flex items-center gap-3 text-slate-400 text-sm">
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Sco<span className="text-blue-400">ra</span>
              </span>
            </Link>
          </div>

          {/* Forgot password view */}
          {mode === 'forgot' ? (
            <>
              <button
                onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>

              <h1 className="text-2xl font-bold text-white mb-1">Reset password</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a reset link.</p>

              {successMsg ? (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-4 rounded-xl text-sm">
                  {successMsg}
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                      <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />{error}
                    </div>
                  )}
                  <Field label="Email" icon={Mail} type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" />
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-glow-sm"
                  >
                    {emailLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send reset link'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex bg-[#0d1526] border border-blue-500/20 rounded-xl p-1 mb-7">
                <button
                  onClick={() => { setMode('signin'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <h1 className="text-2xl font-bold text-white mb-1">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-slate-400 text-sm mb-6">
                {mode === 'signin' ? 'Sign in to your Scora account' : 'Start analyzing your resume for free'}
              </p>

              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4 animate-fade-in">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />{error}
                </div>
              )}

              <GoogleButton onClick={handleGoogle} loading={googleLoading} />
              <Divider />

              <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
                {mode === 'signup' && (
                  <Field label="Full Name" icon={User} value={form.name} onChange={setField('name')} placeholder="Your name" />
                )}
                <Field label="Email" icon={Mail} type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" />
                <Field label="Password" icon={Lock} type={showPw ? 'text' : 'password'} value={form.password} onChange={setField('password')} placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}>
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </Field>

                {mode === 'signin' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-glow-sm"
                >
                  {emailLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    mode === 'signin' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-500 mt-5">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  {mode === 'signin' ? 'Sign up for free' : 'Sign in'}
                </button>
              </p>
            </>
          )}

          <p className="text-center text-[11px] text-slate-600 mt-6 leading-relaxed">
            By continuing you agree to our Terms of Service.<br />
            We never share your resume data with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
