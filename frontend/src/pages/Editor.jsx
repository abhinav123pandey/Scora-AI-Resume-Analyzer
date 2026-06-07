import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle2, Lightbulb, Loader2, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

// ─── Section parser ───────────────────────────────────────────────────────────
// Splits raw resume text into labeled sections using common header patterns.
// Each section becomes its own editable textarea.
const SECTION_PATTERNS = [
  { key: 'summary',    label: 'Summary / Objective', regex: /^(summary|objective|profile|about me|about|professional summary)/im },
  { key: 'experience', label: 'Work Experience',      regex: /^(experience|work experience|employment|professional experience|work history)/im },
  { key: 'education',  label: 'Education',             regex: /^(education|academic|qualifications|academic background|degrees)/im },
  { key: 'skills',     label: 'Skills',                regex: /^(skills|technical skills|core competencies|technologies|expertise|key skills)/im },
  { key: 'projects',   label: 'Projects',              regex: /^(projects|personal projects|key projects|portfolio|notable projects)/im },
  { key: 'certifications', label: 'Certifications',   regex: /^(certifications|certificates|licenses)/im },
];

const parseIntoSections = (text) => {
  if (!text) return [];

  const lines = text.split('\n');
  const found = [];
  let currentKey = null;
  let currentLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    let matched = false;

    for (const { key, label, regex } of SECTION_PATTERNS) {
      if (regex.test(trimmed)) {
        // Save previous section
        if (currentKey) {
          found.push({ key: currentKey, label: getLabelForKey(currentKey), content: currentLines.join('\n').trim() });
        }
        currentKey = key;
        currentLines = [line];
        matched = true;
        break;
      }
    }
    if (!matched && currentKey) {
      currentLines.push(line);
    }
  }

  // Save last section
  if (currentKey) {
    found.push({ key: currentKey, label: getLabelForKey(currentKey), content: currentLines.join('\n').trim() });
  }

  return found;
};

const getLabelForKey = (key) => {
  const p = SECTION_PATTERNS.find(s => s.key === key);
  return p ? p.label : key;
};

// Rejoin sections back into a single text string
const joinSections = (sections) => sections.map(s => s.content).join('\n\n');

// ─── Section Editor card ──────────────────────────────────────────────────────
const SectionCard = ({ section, onChange }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
      <div className="w-2 h-2 bg-violet-500 rounded-full" />
      <h3 className="font-semibold text-slate-800 text-sm">{section.label}</h3>
    </div>
    <textarea
      value={section.content}
      onChange={(e) => onChange(section.key, e.target.value)}
      rows={Math.max(4, section.content.split('\n').length + 1)}
      className="w-full px-5 py-4 text-sm text-slate-700 font-mono leading-relaxed resize-none focus:outline-none placeholder-slate-300"
      placeholder={`Edit ${section.label.toLowerCase()} here…`}
    />
  </div>
);

// ─── AI suggestion card ───────────────────────────────────────────────────────
const SuggestionCard = ({ suggestion, onApply }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <p className="text-xs text-slate-500 mb-1">Current wording:</p>
        <p className="text-sm text-slate-700 line-clamp-2">{suggestion.original}</p>
        <p className="text-xs text-violet-500 font-medium mt-1.5">{expanded ? '▲ Hide suggestion' : '▼ Show AI improvement'}</p>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-emerald-50/50">
          <p className="text-xs text-emerald-600 font-semibold mb-1">AI Improved:</p>
          <p className="text-sm text-slate-800 font-medium mb-3">{suggestion.improved}</p>
          <button
            onClick={() => { onApply(suggestion); setExpanded(false); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <CheckCircle2 size={12} /> Apply this change
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Editor component ────────────────────────────────────────────────────
const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [sections, setSections] = useState([]);
  const [rawMode, setRawMode] = useState(false);   // toggle: section view vs. raw textarea
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // ── Load resume from backend ─────────────────────────────────────────────
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data } = await api.get(`/resumes/${id}`);
        const r = data.resume;
        setResume(r);

        // Use editedText if the user has saved a previous edit, otherwise use original
        const text = r.editedText || r.resumeText || '';
        setRawText(text);
        setWordCount(countWords(text));

        const parsed = parseIntoSections(text);
        if (parsed.length > 0) {
          setSections(parsed);
        } else {
          // No recognizable sections — default to raw mode
          setRawMode(true);
        }
      } catch {
        setError('Could not load resume. Please go back and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

  // ── Section content change ───────────────────────────────────────────────
  const handleSectionChange = useCallback((key, value) => {
    setSections(prev => {
      const updated = prev.map(s => s.key === key ? { ...s, content: value } : s);
      const joined = joinSections(updated);
      setWordCount(countWords(joined));
      return updated;
    });
  }, []);

  // ── Apply an AI suggestion to the raw text ───────────────────────────────
  const applyAiSuggestion = useCallback((suggestion) => {
    const currentText = rawMode ? rawText : joinSections(sections);
    const updatedText = currentText.replace(suggestion.original, suggestion.improved);

    if (updatedText === currentText) {
      toast('Suggestion could not be auto-applied — the original text was not found. Copy it manually.', { icon: 'ℹ️' });
      return;
    }

    if (rawMode) {
      setRawText(updatedText);
      setWordCount(countWords(updatedText));
    } else {
      const parsed = parseIntoSections(updatedText);
      setSections(parsed.length > 0 ? parsed : sections);
    }
    toast.success('Suggestion applied!');
  }, [rawMode, rawText, sections]);

  // ── Save to backend ──────────────────────────────────────────────────────
  const handleSave = async () => {
    const textToSave = rawMode ? rawText : joinSections(sections);
    if (!textToSave.trim()) {
      toast.error('Resume cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/resumes/${id}`, { editedText: textToSave });
      toast.success('Resume saved successfully!');
    } catch {
      toast.error('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle raw/sections mode ─────────────────────────────────────────────
  const toggleMode = () => {
    if (rawMode) {
      // Switching from raw to sections — parse the current raw text
      const parsed = parseIntoSections(rawText);
      if (parsed.length === 0) {
        toast('No recognizable sections found. Keep editing in raw mode.', { icon: 'ℹ️' });
        return;
      }
      setSections(parsed);
      setRawMode(false);
    } else {
      // Switching from sections to raw — join them
      setRawText(joinSections(sections));
      setRawMode(true);
    }
  };

  // ── Loading / Error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-violet-600 h-10 w-10 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading resume…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <p className="text-slate-700 mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const suggestions = resume?.analysis?.suggestions || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate(`/analysis/${id}`)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Analysis
            </button>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText size={20} className="text-violet-600" />
              {resume?.fileName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">{wordCount} words · {sections.length > 0 && !rawMode ? `${sections.length} sections` : 'raw text'}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              title={rawMode ? 'Switch to section view' : 'Switch to raw text mode'}
            >
              <RefreshCw size={12} />
              {rawMode ? 'Section View' : 'Raw Text'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* ── Left: Editor ── */}
          <div className="space-y-4">
            {rawMode ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full" />
                  <h3 className="font-semibold text-slate-800 text-sm">Full Resume Text</h3>
                  <span className="ml-auto text-xs text-slate-400">Edit freely — Scora will re-analyze when you upload again</span>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => { setRawText(e.target.value); setWordCount(countWords(e.target.value)); }}
                  rows={30}
                  className="w-full px-5 py-4 text-sm text-slate-700 font-mono leading-relaxed resize-none focus:outline-none"
                  placeholder="Your resume text will appear here…"
                />
              </div>
            ) : sections.length > 0 ? (
              sections.map((section) => (
                <SectionCard key={section.key} section={section} onChange={handleSectionChange} />
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <p className="text-slate-500 text-sm">No sections were detected. <button onClick={() => setRawMode(true)} className="text-violet-600 font-medium">Edit in raw mode</button>.</p>
              </div>
            )}
          </div>

          {/* ── Right: AI Suggestions ── */}
          <div className="space-y-4">
            {/* Info banner */}
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3.5">
              <div className="flex items-start gap-2.5">
                <Lightbulb size={16} className="text-violet-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-violet-900">AI Suggestions</p>
                  <p className="text-xs text-violet-700 mt-0.5 leading-relaxed">
                    These improvements were generated from your last analysis. Click any suggestion to apply it.
                  </p>
                </div>
              </div>
            </div>

            {suggestions.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 px-4 py-6 text-center">
                <p className="text-sm text-slate-500">No suggestions available. Run a new analysis to get AI improvements.</p>
              </div>
            ) : (
              suggestions.map((s, idx) => (
                <SuggestionCard key={idx} suggestion={s} onApply={applyAiSuggestion} />
              ))
            )}

            {/* Pro tip */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4">
              <p className="text-xs font-semibold text-slate-700 mb-1.5">✍️ Writing Tips</p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li>• Start every bullet with a strong action verb (Built, Led, Reduced)</li>
                <li>• Add numbers: "Improved load time by 40%"</li>
                <li>• Keep bullets to 1–2 lines each</li>
                <li>• Mirror keywords from the job description</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
