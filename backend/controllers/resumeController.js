const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Resume = require('../models/Resume');
const { extractTextFromFile } = require('../utils/parseResume');
const { analyzeResume } = require('../utils/analyzeResume');

// --- Multer setup for file uploads ---
// Files are saved to /uploads/ with original name + timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Only allow PDF and Word documents
const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// POST /api/resumes/upload
// Uploads a resume, parses it, runs AI analysis, and saves everything to DB
const uploadResume = async (req, res) => {
  try {
    const { jobDescription, targetRole } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (!jobDescription || !targetRole) {
      return res.status(400).json({ success: false, message: 'Job description and target role are required' });
    }

    // Step 1: Extract text from the uploaded file
    const resumeText = await extractTextFromFile(file.path);

    // Step 2: Run the full AI analysis
    const analysis = await analyzeResume(resumeText, jobDescription, targetRole);

    // Step 3: Save everything to MongoDB
    const resume = await Resume.create({
      user: req.user._id,
      fileName: file.originalname,
      filePath: file.path,
      resumeText,
      jobDescription,
      targetRole,
      analysis,
      isAnalyzed: true,
    });

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      resumeId: resume._id,
      analysis,
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/resumes
// Returns all resumes uploaded by the logged-in user
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select('fileName targetRole analysis.atsScore analysis.matchScore createdAt')
      .sort({ createdAt: -1 }); // newest first

    res.json({
      success: true,
      resumes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/resumes/:id
// Returns full analysis for a single resume
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id, // ensures user can only see their own resumes
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/resumes/:id
// Deletes a resume and its uploaded file from disk
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Delete the actual file from disk
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await resume.deleteOne();

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/resumes/:id
// Saves the user's edited resume text from the Editor page
const updateResume = async (req, res) => {
  try {
    const { editedText } = req.body;

    if (!editedText || !editedText.trim()) {
      return res.status(400).json({ success: false, message: 'Resume text cannot be empty' });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    resume.editedText = editedText;
    await resume.save();

    res.json({
      success: true,
      message: 'Resume saved successfully',
      editedText: resume.editedText,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { upload, uploadResume, getResumes, getResumeById, deleteResume, updateResume };
