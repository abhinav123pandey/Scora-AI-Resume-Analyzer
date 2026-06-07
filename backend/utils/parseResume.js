const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Extract plain text from a PDF or DOCX file
// Returns the raw text string
const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (ext === '.pdf') {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }

  if (ext === '.doc' || ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }

  throw new Error('Unsupported file type. Upload PDF, DOC, or DOCX.');
};

module.exports = { extractTextFromFile };
