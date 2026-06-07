import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, AlertCircle, Lightbulb,
  ThumbsUp, Edit, Download, ArrowLeft, Loader2, Zap, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Circular score ring — pure CSS/SVG, no library needed
const ScoreCircle = ({ score, label, size = 140 }) => {
  const strokeW = 10;
  const radius = (size - strokeW) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const bg = score >= 80 ? '#ecfdf5' : score >= 60 ? '#fffbeb' : '#fef2f2';
  const textColor = score >= 80 ? '#065f46' : score >= 60 ? '#92400e' : '#991b1b';
  const strength = score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeW}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-900 text-sm">{label}</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: bg, color: textColor }}>
          {strength}
        </span>
      </div>
    </div>
  );
};

// Horizontal progress bar for breakdown scores
const ScoreBar = ({ label, value }) => {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-700 font-medium capitalize">{label}</span>
        <span className="text-slate-500 font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data } = await api.get(`/resumes/${id}`);
        setAnalysis(data.resume.analysis);
        setFileName(data.resume.fileName);
      } catch {
        setError('This analysis was not found or you do not have access to it.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-violet-600 h-10 w-10 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">Analysis not found</h3>
          <p className="text-slate-500 text-sm mb-5">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb + title */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900 truncate">{fileName}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Resume Analysis Report</p>
        </div>

        {/* ── Score Summary ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-5 shadow-card">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
            <ScoreCircle score={analysis.atsScore} label="ATS Score" />
            <div className="w-px h-24 bg-slate-100 hidden sm:block" />
            <ScoreCircle score={analysis.matchScore} label="Job Match" />
          </div>
        </div>

        {/* ── Score Breakdown ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-card">
          <h2 className="font-semibold text-slate-900 mb-5">Score Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(analysis.breakdown).map(([key, val]) => (
              <ScoreBar key={key} label={key} value={val} />
            ))}
          </div>
        </div>

        {/* ── Keyword Analysis ── */}
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              Matched Keywords
              <span className="ml-auto text-xs font-normal text-slate-400">{analysis.matchedKeywords.length} found</span>
            </h2>
            {analysis.matchedKeywords.length === 0 ? (
              <p className="text-slate-400 text-sm">No keywords matched. Add more relevant skills.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords.map(kw => (
                  <span key={kw} className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <XCircle size={18} className="text-red-400" />
              Missing Keywords
              <span className="ml-auto text-xs font-normal text-slate-400">{analysis.missingKeywords.length} missing</span>
            </h2>
            {analysis.missingKeywords.length === 0 ? (
              <p className="text-emerald-600 text-sm font-medium">All keywords matched! 🎉</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map(kw => (
                  <span key={kw} className="text-xs font-medium px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Section Feedback ── */}
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          {Object.entries(analysis.sections).map(([section, data]) => {
            const scoreColor = data.score >= 80 ? 'text-emerald-600' : data.score >= 60 ? 'text-amber-600' : 'text-red-500';
            const scoreBg = data.score >= 80 ? 'bg-emerald-50' : data.score >= 60 ? 'bg-amber-50' : 'bg-red-50';
            return (
              <div key={section} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 capitalize text-sm">{section}</h3>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${scoreBg} ${scoreColor}`}>{data.score}%</span>
                </div>
                <p className="text-xs text-slate-500 mb-1"><span className="font-medium text-slate-700">Issue:</span> {data.issues}</p>
                <p className="text-xs text-slate-500"><span className="font-medium text-slate-700">Fix:</span> {data.suggestions}</p>
              </div>
            );
          })}
        </div>

        {/* ── AI Suggestions ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-card">
          <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500" />
            AI-Powered Suggestions
          </h2>
          <div className="space-y-4">
            {analysis.suggestions.map((s, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-red-50/60 px-4 py-3 border-b border-slate-200">
                  <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wide mb-1">Before</p>
                  <p className="text-sm text-slate-700">{s.original}</p>
                </div>
                <div className="bg-emerald-50/60 px-4 py-3">
                  <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">After (AI Improved)</p>
                  <p className="text-sm text-slate-800 font-medium">{s.improved}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Red Flags ── */}
        {analysis.redFlags.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-200 p-6 mb-8 shadow-card">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              Issues to Fix
            </h2>
            <ul className="space-y-2.5">
              {analysis.redFlags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
                  <span className="text-sm text-slate-700">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to={`/editor/${id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Edit size={15} /> Edit Resume
          </Link>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <Zap size={15} /> Analyze Another
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
