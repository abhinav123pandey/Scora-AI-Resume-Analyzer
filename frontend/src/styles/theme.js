// Centralized design tokens — import these instead of repeating Tailwind class strings.
// This is the single source of truth for the Scora design system.

// Primary color: violet-600 (#7c3aed)
// Surface: white with slate-200 borders
// Background: slate-50
// Text: slate-900 (headings), slate-600 (body), slate-400 (muted)

export const tw = {
  // ── Page layout ──────────────────────────────────────
  page: 'min-h-screen bg-slate-50',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10',
  containerSm: 'max-w-3xl mx-auto px-4 sm:px-6 py-10',

  // ── Cards ─────────────────────────────────────────────
  card: 'bg-white rounded-2xl border border-slate-200 shadow-card',
  cardHover: 'bg-white rounded-2xl border border-slate-200 shadow-card hover:border-violet-200 hover:shadow-card-hover transition-all duration-200',

  // ── Typography ────────────────────────────────────────
  pageTitle: 'text-2xl font-bold text-slate-900',
  pageSubtitle: 'text-slate-500 text-sm mt-1',
  sectionTitle: 'font-semibold text-slate-900',
  label: 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5',
  muted: 'text-sm text-slate-500',

  // ── Form inputs ──────────────────────────────────────
  input: 'w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 transition-all',
  textarea: 'w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-slate-700 placeholder-slate-400 transition-all',

  // ── Buttons ──────────────────────────────────────────
  btnPrimary: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  btnOutline: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors',
  btnDanger: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition-colors',
  btnGhost: 'inline-flex items-center justify-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors',

  // ── Badges ───────────────────────────────────────────
  badgeGreen: 'text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200',
  badgeAmber: 'text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200',
  badgeRed: 'text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200',
  badgeViolet: 'text-xs font-medium px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200',

  // ── Alerts ───────────────────────────────────────────
  alertError: 'flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm',
  alertSuccess: 'flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm',
  alertInfo: 'flex items-start gap-3 bg-violet-50 border border-violet-200 text-violet-700 px-4 py-3 rounded-xl text-sm',

  // ── Loading spinner ──────────────────────────────────
  spinner: 'w-5 h-5 border-2 border-slate-200 border-t-violet-600 rounded-full animate-spin',
};

// Score color helpers — used in Analysis and Dashboard
export const getScoreColor = (score) => {
  if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', hex: '#10b981' };
  if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', hex: '#f59e0b' };
  return { text: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', hex: '#ef4444' };
};

export const getScoreLabel = (score) => {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Moderate';
  return 'Needs Work';
};
