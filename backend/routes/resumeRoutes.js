const express = require('express');
const router = express.Router();
const {
  upload,
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
  updateResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

// All resume routes are protected — user must be logged in
router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResumes);
router.get('/:id', protect, getResumeById);
router.put('/:id', protect, updateResume);
router.delete('/:id', protect, deleteResume);

module.exports = router;
