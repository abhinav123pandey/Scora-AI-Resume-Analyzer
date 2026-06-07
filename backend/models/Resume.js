const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  resumeText: {
    type: String, // raw extracted text from the PDF/DOCX
  },
  jobDescription: {
    type: String,
  },
  targetRole: {
    type: String,
  },
  // The full analysis result stored as a JSON object
  analysis: {
    atsScore: Number,
    matchScore: Number,
    strength: String,
    breakdown: {
      formatting: Number,
      keywords: Number,
      projects: Number,
      experience: Number,
    },
    matchedKeywords: [String],
    missingKeywords: [String],
    sections: {
      skills:      { score: Number, issues: String, suggestions: String },
      projects:    { score: Number, issues: String, suggestions: String },
      experience:  { score: Number, issues: String, suggestions: String },
    },
    suggestions: [
      {
        original: String,
        improved: String,
      },
    ],
    redFlags: [String],
  },
  // editedText is the user-modified version from the Editor page.
  // We keep the original resumeText separate so the user can always revert.
  editedText: {
    type: String,
  },
  isAnalyzed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
