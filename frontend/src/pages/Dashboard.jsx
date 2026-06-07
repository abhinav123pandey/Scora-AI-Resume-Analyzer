import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus, Eye, Trash2, TrendingUp, Award, FileText,
  Upload, ArrowRight, Zap, Target, BarChart3, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { StatCardSkeleton, ResumeCardSkeleton } from '../components/ui/Skeleton';

// Circular progress ring — pure CSS, shows ATS score visually
const ScoreRing = ({ score, size = 64, strokeWidth = 6, color = '#7c3aed' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-800">{score}</span>
    </div>
  );
};

// Single stat card with icon, value, and label
const StatCard = ({ icon: Icon, label, value, sub, gradient }) => (
  <div className={`relative overflow-hidden rounded-xl border border-white/20 p-5 ${gradient}`}>
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-white/80 text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
    </div>
  </div>
);

// Score color thresholds — used for rings and badges
const getScoreColor = (score) => {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // amber
  return '#ef4444'; // red
};

const getScoreBadge = (score) => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700';
  if (score >= 60) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Get the time of day for the greeting
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data } = await api.get('/resumes');
        setResumes(data.resumes);
      } catch {
        toast.error('Failed to load your resumes.');
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success('Resume deleted.');
    } catch {
      toast.error('Could not delete resume.');
    }
  };

  // Computed stats from real data
  const avgAts = resumes.length
    ? Math.round(resumes.reduce((a, r) => a + (r.analysis?.atsScore || 0), 0) / resumes.length)
    : 0;
  const bestScore = resumes.length
    ? Math.max(...resumes.map(r => r.analysis?.atsScore || 0))
    : 0;
  const avgMatch = resumes.length
    ? Math.round(resumes.reduce((a, r) => a + (r.analysis?.matchScore || 0), 0) / resumes.length)
    : 0;

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {greeting()}, {firstName} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} />
            Analyze Resume
          </Link>
        </div>

        {/* ── Stat Cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
            <StatCard
              icon={FileText}
              label="Total Resumes"
              value={resumes.length}
              sub="uploaded so far"
              gradient="bg-gradient-to-br from-violet-500 to-violet-700"
            />
            <StatCard
              icon={BarChart3}
              label="Avg ATS Score"
              value={avgAts ? `${avgAts}%` : '—'}
              sub="across all resumes"
              gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            />
            <StatCard
              icon={Award}
              label="Best Score"
              value={bestScore ? `${bestScore}%` : '—'}
              sub="your top performance"
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
            />
            <StatCard
              icon={Target}
              label="Avg Job Match"
              value={avgMatch ? `${avgMatch}%` : '—'}
              sub="keyword match rate"
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            />
          </div>
        )}

        {/* ── Resume List ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Resumes</h2>
          {resumes.length > 0 && (
            <Link to="/history" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <ResumeCardSkeleton key={i} />)}
          </div>
        ) : resumes.length === 0 ? (
          /* ── Empty state ── */
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload size={24} className="text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No resumes yet</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
              Upload your resume and a job description to get your ATS score and AI-powered improvements.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Zap size={16} />
              Analyze my first resume
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 animate-slide-up">
            {resumes.map((resume) => {
              const ats = resume.analysis?.atsScore || 0;
              const match = resume.analysis?.matchScore || 0;
              return (
                <div
                  key={resume._id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-violet-200 hover:shadow-card-hover transition-all duration-200 group"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate" title={resume.fileName}>
                        {resume.fileName}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-slate-400" />
                        <p className="text-xs text-slate-400">
                          {new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* ATS score ring */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
                      <ScoreRing score={ats} size={52} strokeWidth={5} color={getScoreColor(ats)} />
                      <span className="text-[10px] text-slate-400 font-medium">ATS</span>
                    </div>
                  </div>

                  {/* Job match bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Job Match</span>
                      <span className={`font-semibold px-1.5 py-0.5 rounded-full text-[10px] ${getScoreBadge(match)}`}>
                        {match}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${match}%`,
                          backgroundColor: getScoreColor(match),
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/analysis/${resume._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Eye size={13} /> View Analysis
                    </Link>
                    <button
                      onClick={() => handleDelete(resume._id, resume.fileName)}
                      className="flex items-center justify-center w-9 h-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* "Analyze another" card */}
            <Link
              to="/upload"
              className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center gap-3 hover:border-violet-300 hover:bg-violet-50/50 transition-all duration-200 min-h-[180px]"
            >
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Plus size={18} className="text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Analyze another resume</p>
                <p className="text-xs text-slate-400 mt-0.5">Upload a new resume to compare</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
