import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, ArrowLeft, Zap } from 'lucide-react';
import { signInWithGoogle } from '../firebase';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ─── Scora logo ──────────────────────────────────────────────────────────────
const Logo = () => (
  <Link to="/" className="flex items-center gap-2 justify-center">
    <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-500 rounded-xl flex items-center justify-center shadow-md">
      <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
    </div>
    <span className="text-2xl font-bold text-slate-900 tracking-tight">
      Sco<span className="text-violet-600">ra</span>
    </span>
  </Link>
);

// ─── Google button ────────────────────────────────────────────────────────────
const GoogleButton = ({ onClick, loading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading ? (
      <div className="w-5 h-5 border-2 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
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

// ─── Divider ─────────────────────────────────────────────────────────────────
const Divider = () => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-slate-200" />
    <span className="text-xs text-slate-400 font-medium">or</span>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

// ─── Input field ─────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
      />
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const Login = () => {
  // 'signin' | 'signup' | 'forgot'
  const [mode, setMode] = useState('signin');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const setField = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setError('');
  };

  // ── Google sign-in ─────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await signInWithGoogle();
      const fb = result.user;
      const { data } = await api.post('/auth/google', {
        googleId: fb.uid,
        name: fb.displayName,
        email: fb.email,
        photoURL: fb.photoURL,
      });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.response?.data?.message || 'Google sign-in failed. Try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Email sign-in ──────────────────────────────────────────────────────────
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setEmailLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Email sign-up ──────────────────────────────────────────────────────────
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setEmailLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/signup', { name: form.name, email: form.email, password: form.password });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) { setError('Enter your email address.'); return; }
    setEmailLoading(true);
    setError('');
    // Simulate — in production you'd call POST /api/auth/forgot-password which sends an email
    await new Promise(r => setTimeout(r, 1000));
    setEmailLoading(false);
    setSuccessMsg(`If an account exists for ${form.email}, a reset link has been sent.`);
  };

  // ─── Left decorative panel ─────────────────────────────────────────────────
  const panelContent = {
    signin: { headline: 'Welcome back to Scora.', sub: 'Sign in to view your ATS scores and resume analyses.' },
    signup: { headline: 'Start your job search journey.', sub: 'Create an account and get your first ATS score in minutes.' },
    forgot: { headline: 'Recover your account.', sub: 'We\'ll send a reset link to your email address.' },
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Left decorative panel ──────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-violet-700 to-violet-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-36 translate-x-36" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-40 -translate-x-40" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-14">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Scora</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            {panelContent[mode].headline}
          </h2>
          <p className="text-violet-200 text-base leading-relaxed">
            {panelContent[mode].sub}
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            '⚡ ATS score in under 30 seconds',
            '🎯 Keyword match against any job description',
            '✨ AI bullet point improvements',
          ].map(f => (
            <div key={f} className="flex items-center gap-3 text-violet-100 text-sm font-medium">
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          {/* Logo (mobile) */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>

          {/* ── FORGOT PASSWORD view ──────────────────────────────── */}
          {mode === 'forgot' ? (
            <>
              <button
                onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>

              <h1 className="text-2xl font-bold text-slate-900 mb-1">Reset password</h1>
              <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>

              {successMsg ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-4 rounded-xl text-sm">
                  {successMsg}
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />{error}
                    </div>
                  )}
                  <Field label="Email" icon={Mail} type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" />
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {emailLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send reset link'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              {/* ── Tab switcher ──────────────────────────────────── */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-7">
                <button
                  onClick={() => { setMode('signin'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sign Up
                </button>
              </div>

              {/* ── Page title ────────────────────────────────────── */}
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-slate-500 text-sm mb-6">
                {mode === 'signin' ? 'Sign in to your Scora account' : 'Start analyzing your resume for free'}
              </p>

              {/* ── Error message ─────────────────────────────────── */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 animate-fade-in">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />{error}
                </div>
              )}

              {/* ── Google button ─────────────────────────────────── */}
              <GoogleButton onClick={handleGoogle} loading={googleLoading} />

              <Divider />

              {/* ── Email / Password form ─────────────────────────── */}
              <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">

                {/* Name field only on signup */}
                {mode === 'signup' && (
                  <Field label="Full Name" icon={User} value={form.name} onChange={setField('name')} placeholder="Your name" />
                )}

                <Field label="Email" icon={Mail} type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" />

                <Field label="Password" icon={Lock} type={showPw ? 'text' : 'password'} value={form.password} onChange={setField('password')} placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}>
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </Field>

                {/* Forgot password link */}
                {mode === 'signin' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
                      className="text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {emailLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    mode === 'signin' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              {/* ── Toggle link ───────────────────────────────────── */}
              <p className="text-center text-xs text-slate-500 mt-5">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                  className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
                >
                  {mode === 'signin' ? 'Sign up for free' : 'Sign in'}
                </button>
              </p>
            </>
          )}

          {/* Fine print */}
          <p className="text-center text-[11px] text-slate-400 mt-6 leading-relaxed">
            By continuing you agree to our Terms of Service.<br />
            We never share your resume data with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
