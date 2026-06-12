import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle, Zap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const ROLE_OPTIONS = [
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'data', label: 'Data Scientist' },
  { value: 'devops', label: 'DevOps Engineer' },
  { value: 'mobile', label: 'Mobile Developer' },
  { value: 'ml', label: 'ML / AI Engineer' },
];

const ANALYSIS_STEPS = [
  { label: 'Uploading resume...', icon: '📤' },
  { label: 'Parsing document...', icon: '📄' },
  { label: 'Matching keywords...', icon: '🔍' },
  { label: 'Running AI analysis...', icon: '✨' },
  { label: 'Finalizing report...', icon: '📊' },
];

const Upload = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const reason = rejectedFiles[0]?.errors?.[0]?.code;
      if (reason === 'file-too-large') setError('File is too large. Max 5MB.');
      else setError('Only PDF, DOC, DOCX files are accepted.');
      return;
    }
    setFile(acceptedFiles[0]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAnalyze = async () => {
    if (!file) { setError('Please upload your resume.'); return; }
    if (!jobDescription.trim()) { setError('Please paste the job description.'); return; }
    if (!role) { setError('Please select your target role.'); return; }

    setLoading(true);
    setError('');
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex(prev => Math.min(prev + 1, ANALYSIS_STEPS.length - 1));
    }, 2500);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobDescription', jobDescription);
      formData.append('targetRole', role);

      const { data } = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(interval);
      toast.success('Analysis complete!');
      navigate(`/analysis/${data.resumeId}`);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isReady = file && jobDescription.trim() && role;

  const stepLabel = (num, text) => (
    <span className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
      {num}
    </span>
  );

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium px-3 py-1 rounded-full mb-4">
            <Zap size={13} /> AI-Powered Analysis
          </div>
          <h1 className="text-3xl font-bold text-white">Analyze Your Resume</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">
            Upload your resume and a job description. We'll give you an ATS score, keyword gaps, and AI suggestions.
          </p>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              {stepLabel(1)}
              Upload Resume
            </h2>

            {file ? (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <button onClick={() => setFile(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-blue-400/60 bg-blue-500/10'
                    : 'border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/5'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className={`mx-auto mb-3 ${isDragActive ? 'text-blue-400' : 'text-slate-600'}`} size={36} />
                {isDragActive ? (
                  <p className="text-blue-400 font-semibold text-sm">Drop your resume here</p>
                ) : (
                  <>
                    <p className="text-slate-300 font-medium text-sm">Drag & drop your resume</p>
                    <p className="text-slate-600 text-xs mt-1">or <span className="text-blue-400 font-medium">click to browse</span></p>
                    <p className="text-slate-600 text-xs mt-3">PDF, DOC, DOCX — max 5 MB</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              {stepLabel(2)}
              Job Description
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={7}
              className="w-full px-4 py-3 text-sm bg-[#0a1020] border border-blue-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 resize-none text-slate-300 placeholder-slate-600 transition-all"
              placeholder="Paste the full job description here. The more detail you include, the better the keyword matching will be."
            />
            <p className="text-xs text-slate-600 mt-2">
              {jobDescription.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {/* Target Role */}
          <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              {stepLabel(3)}
              Target Role
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRole(option.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 text-left ${
                    role === option.value
                      ? 'border-blue-500/60 bg-blue-500/15 text-blue-300'
                      : 'border-blue-500/15 text-slate-400 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {loading && (
            <div className="bg-[#0d1526] rounded-2xl border border-blue-500/20 p-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                  <Loader2 size={20} className="text-blue-400 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {ANALYSIS_STEPS[stepIndex].icon} {ANALYSIS_STEPS[stepIndex].label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">This takes 10–30 seconds</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 bg-[#162033] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((stepIndex + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!isReady || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all duration-150 shadow-glow-sm disabled:shadow-none"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Zap size={16} /> Analyze Resume</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
