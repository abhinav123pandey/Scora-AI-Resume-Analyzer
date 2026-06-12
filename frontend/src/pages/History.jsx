import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, Calendar, TrendingUp, Plus, FileText, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { ResumeCardSkeleton } from '../components/ui/Skeleton';

const getScoreBadge = (score) => {
  if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (score >= 60) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return 'bg-red-500/10 text-red-400 border-red-500/20';
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/resumes');
        setHistory(data.resumes);
      } catch {
        toast.error('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      await api.delete(`/resumes/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
      toast.success('Resume deleted.');
    } catch {
      toast.error('Could not delete resume.');
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Resume History</h1>
            <p className="text-slate-500 text-sm mt-1">All your past analyses in one place</p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-glow-sm"
          >
            <Plus size={15} /> Analyze New
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <ResumeCardSkeleton key={i} />)}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[#0d1526] rounded-2xl border border-dashed border-blue-500/20 p-14 text-center">
            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={22} className="text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">No history yet</h3>
            <p className="text-slate-500 text-sm mb-6">Start by analyzing your first resume.</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-glow-sm"
            >
              <Zap size={15} /> Analyze a resume
            </Link>
          </div>
        ) : (
          <div className="space-y-3 animate-slide-up">
            {history.map((item) => {
              const ats = item.analysis?.atsScore || 0;
              const match = item.analysis?.matchScore || 0;
              return (
                <div
                  key={item._id}
                  className="bg-[#0d1526] rounded-xl border border-blue-500/20 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-400/40 hover:shadow-card-hover transition-all duration-150"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{item.fileName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar size={11} />
                          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <TrendingUp size={11} />
                          Match: {match}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getScoreBadge(ats)}`}>
                      ATS: {ats}%
                    </span>
                    <Link
                      to={`/analysis/${item._id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Eye size={13} /> View
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id, item.fileName)}
                      className="flex items-center justify-center w-8 h-8 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
