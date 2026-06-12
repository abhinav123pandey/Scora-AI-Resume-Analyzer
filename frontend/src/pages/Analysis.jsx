import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, AlertCircle, Lightbulb,
  Edit, ArrowLeft, Loader2, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const ScoreCircle = ({ score, label, size = 140 }) => {
  const strokeW = 10;
  const radius = (size - strokeW) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const strength = score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : 'Needs Work';
  const badgeCls = score >= 80
    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    : score >= 60
    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    : 'bg-red-500/10 text-red-400 border border-red-500/20';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#162033" strokeWidth={strokeW} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeW}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-300 text-sm">{label}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeCls}`}>{strength}</span>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, value }) => {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-300 font-medium capitalize">{label}</span>
        <span className="text-slate-400 font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-[#162033] rounded-full overflow-hidden">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-400 h-10 w-10 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-10 text-center max-w-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">Analysis not found</h3>
          <p className="text-slate-400 text-sm mb-5">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white truncate">{fileName}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Resume Analysis Report</p>
        </div>

        {/* Score Summary */}
        <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-8 mb-5">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-8">
            <ScoreCircle score={analysis.atsScore} label="ATS Score" />
            <div className="w-px h-24 bg-blue-500/10 hidden sm:block" />
            <ScoreCircle score={analysis.matchScore} label="Job Match" />
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-6 mb-5">
          <h2 className="font-semibold text-white mb-5">Score Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(analysis.breakdown).map(([key, val]) => (
              <ScoreBar key={key} label={key} value={val} />
            ))}
          </div>
        </div>

        {/* Keyword Analysis */}
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              Matched Keywords
              <span className="ml-auto text-xs font-normal text-slate-500">{analysis.matchedKeywords.length} found</span>
            </h2>
            {analysis.matchedKeywords.length === 0 ? (
              <p className="text-slate-500 text-sm">No keywords matched. Add more relevant skills.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords.map(kw => (
                  <span key={kw} className="text-xs font-medium px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <XCircle size={18} className="text-red-400" />
              Missing Keywords
              <span className="ml-auto text-xs font-normal text-slate-500">{analysis.missingKeywords.length} missing</span>
            </h2>
            {analysis.missingKeywords.length === 0 ? (
              <p className="text-emerald-400 text-sm font-medium">All keywords matched! 🎉</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map(kw => (
                  <span key={kw} className="text-xs font-medium px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Feedback */}
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          {Object.entries(analysis.sections).map(([section, data]) => {
            const scoreColor = data.score >= 80 ? 'text-emerald-400' : data.score >= 60 ? 'text-amber-400' : 'text-red-400';
            const scoreBg = data.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : data.score >= 60 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';
            return (
              <div key={section} className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-300 capitalize text-sm">{section}</h3>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-lg border ${scoreBg} ${scoreColor}`}>{data.score}%</span>
                </div>
                <p className="text-xs text-slate-500 mb-1"><span className="font-medium text-slate-400">Issue:</span> {data.issues}</p>
                <p className="text-xs text-slate-500"><span className="font-medium text-slate-400">Fix:</span> {data.suggestions}</p>
              </div>
            );
          })}
        </div>

        {/* AI Suggestions */}
        <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-6 mb-5">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Lightbulb size={18} className="text-blue-400" />
            AI-Powered Suggestions
          </h2>
          <div className="space-y-4">
            {analysis.suggestions.map((s, idx) => (
              <div key={idx} className="border border-blue-500/15 rounded-xl overflow-hidden">
                <div className="bg-red-500/5 border-b border-blue-500/10 px-4 py-3">
                  <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wide mb-1">Before</p>
                  <p className="text-sm text-slate-400">{s.original}</p>
                </div>
                <div className="bg-emerald-500/5 px-4 py-3">
                  <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide mb-1">After (AI Improved)</p>
                  <p className="text-sm text-slate-200 font-medium">{s.improved}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Red Flags */}
        {analysis.redFlags.length > 0 && (
          <div className="bg-[#0d1526] rounded-2xl border border-red-500/20 p-6 mb-8">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-400" />
              Issues to Fix
            </h2>
            <ul className="space-y-2.5">
              {analysis.redFlags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
                  <span className="text-sm text-slate-400">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to={`/editor/${id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-glow-sm"
          >
            <Edit size={15} /> Edit Resume
          </Link>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#162033] border border-blue-500/20 hover:border-blue-400/40 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
          >
            <Zap size={15} /> Analyze Another
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
