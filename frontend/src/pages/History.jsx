import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, Calendar, TrendingUp, Plus, FileText, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { ResumeCardSkeleton } from '../components/ui/Skeleton';

const getScoreBadge = (score) => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-red-100 text-red-700 border-red-200';
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
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resume History</h1>
            <p className="text-slate-500 text-sm mt-1">All your past analyses in one place</p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={15} /> Analyze New
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <ResumeCardSkeleton key={i} />)}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={22} className="text-violet-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">No history yet</h3>
            <p className="text-slate-500 text-sm mb-6">Start by analyzing your first resume.</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
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
                  className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-violet-200 hover:shadow-card transition-all duration-150"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* File icon */}
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-violet-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{item.fileName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar size={11} />
                          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
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
                      className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Eye size={13} /> View
                    </Link>

                    <button
                      onClick={() => handleDelete(item._id, item.fileName)}
                      className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
