const OpenAI = require('openai');

// Common tech keywords to identify in resumes and job descriptions
const TECH_KEYWORDS = [
  'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind',
  'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Flask',
  'Java', 'Spring', 'Kotlin', 'Go', 'Rust', 'C++', 'C#', '.NET',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
  'REST APIs', 'GraphQL', 'WebSockets',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD',
  'Git', 'GitHub', 'Linux', 'Bash',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'Testing', 'Jest', 'Cypress', 'Mocha', 'Selenium',
  'Agile', 'Scrum', 'JIRA',
];

// Extract keywords that appear in a given text (case-insensitive)
const extractKeywords = (text) => {
  return TECH_KEYWORDS.filter(kw =>
    text.toLowerCase().includes(kw.toLowerCase())
  );
};

// Calculate a simple score from 0–100 based on keyword match rate
const calculateMatchScore = (resumeKeywords, jdKeywords) => {
  if (jdKeywords.length === 0) return 50;
  const matched = resumeKeywords.filter(kw => jdKeywords.includes(kw));
  return Math.round((matched.length / jdKeywords.length) * 100);
};

// Simple heuristic scoring for ATS-friendliness based on resume text
const calculateAtsScore = (resumeText, matchScore) => {
  let score = 50;

  // Reward having common section headers (ATS parsers look for these)
  const sections = ['experience', 'education', 'skills', 'projects', 'summary'];
  sections.forEach(s => {
    if (resumeText.toLowerCase().includes(s)) score += 5;
  });

  // Reward measurable outcomes (numbers usually signal strong bullets)
  const metrics = resumeText.match(/\d+(%|x|\+|k|\s*million|\s*thousand)/gi);
  if (metrics && metrics.length > 2) score += 10;

  // Keyword match also boosts ATS score
  score += Math.round(matchScore * 0.2);

  return Math.min(score, 99); // cap at 99 so it's not a perfect fake score
};

// Use OpenAI to generate 2 AI-improved bullet point suggestions
const getAiSuggestions = async (resumeText) => {
  // If no API key, return helpful fallback suggestions
  if (!process.env.OPENAI_API_KEY) {
    return [
      {
        original: 'Worked on web applications using React',
        improved: 'Developed 3+ React web applications with reusable components, reducing development time by 30%',
      },
      {
        original: 'Responsible for database management',
        improved: 'Managed MongoDB databases with 10,000+ records, writing optimized queries that improved response time by 45%',
      },
    ];
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an expert resume writer. Given this resume text, find 2 weak bullet points and rewrite them to be stronger.

Rules:
- Add specific numbers/metrics (made-up but realistic)
- Use strong action verbs
- Focus on impact, not just responsibility
- Keep each bullet under 20 words

Return ONLY valid JSON in this exact format (no extra text):
[
  { "original": "the weak bullet", "improved": "the stronger rewritten version" },
  { "original": "another weak bullet", "improved": "another stronger version" }
]

Resume text:
${resumeText.slice(0, 1500)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (err) {
    console.error('OpenAI error (using fallback):', err.message);
    // Fallback if OpenAI fails
    return [
      {
        original: 'Worked on web applications using React',
        improved: 'Built 3+ production React apps with responsive design, improving user engagement by 35%',
      },
      {
        original: 'Helped with database tasks',
        improved: 'Optimized MongoDB queries, reducing average API response time from 800ms to 120ms',
      },
    ];
  }
};

// Identify common red flags in resume text
const findRedFlags = (resumeText) => {
  const flags = [];
  const text = resumeText.toLowerCase();

  const weakPhrases = ['responsible for', 'worked on', 'helped with', 'assisted in', 'involved in'];
  weakPhrases.forEach(phrase => {
    if (text.includes(phrase)) {
      flags.push(`Uses weak phrase: "${phrase}" — replace with a strong action verb`);
    }
  });

  const hasMetrics = /\d+(%|x|\+|k|\s*million)/.test(resumeText);
  if (!hasMetrics) flags.push('No measurable results or metrics mentioned');

  if (!text.includes('project')) flags.push('No projects section found — add 2-3 projects');

  if (resumeText.split(' ').length < 200) flags.push('Resume seems too short — aim for at least 400 words');

  return flags.slice(0, 4); // max 4 red flags
};

// Compute a section-level breakdown score
const getSectionScores = (resumeText, matchScore) => {
  const text = resumeText.toLowerCase();

  // Simple heuristics per section
  const hasFormattedSections = ['skills', 'experience', 'education', 'projects'].filter(s => text.includes(s)).length;
  const formattingScore = Math.min(50 + hasFormattedSections * 12, 95);

  const keywordsScore = matchScore;
  const projectsScore = text.includes('project') ? Math.min(matchScore + 10, 90) : 40;
  const experienceScore = text.includes('experience') ? Math.min(matchScore + 5, 88) : 45;

  return {
    breakdown: {
      formatting: formattingScore,
      keywords: keywordsScore,
      projects: projectsScore,
      experience: experienceScore,
    },
    sections: {
      skills: {
        score: keywordsScore,
        issues: keywordsScore < 60 ? 'Missing key technical skills from JD' : 'Good coverage of required skills',
        suggestions: 'Add specific tools and frameworks you have used in projects',
      },
      projects: {
        score: projectsScore,
        issues: projectsScore < 60 ? 'Projects lack quantifiable outcomes' : 'Projects are well-described',
        suggestions: 'Quantify each project: users served, performance improved, time saved',
      },
      experience: {
        score: experienceScore,
        issues: experienceScore < 60 ? 'Experience section uses passive language' : 'Experience section is strong',
        suggestions: 'Start every bullet with a past-tense action verb (Built, Reduced, Improved)',
      },
    },
  };
};

// Master function: runs the full analysis pipeline
const analyzeResume = async (resumeText, jobDescription, targetRole) => {
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jobDescription);

  const matchedKeywords = resumeKeywords.filter(kw => jdKeywords.includes(kw));
  const missingKeywords = jdKeywords.filter(kw => !resumeKeywords.includes(kw));

  const matchScore = calculateMatchScore(resumeKeywords, jdKeywords);
  const atsScore = calculateAtsScore(resumeText, matchScore);

  const strength =
    atsScore >= 80 ? 'Strong' :
    atsScore >= 60 ? 'Moderate' :
    'Needs Improvement';

  const { breakdown, sections } = getSectionScores(resumeText, matchScore);
  const suggestions = await getAiSuggestions(resumeText);
  const redFlags = findRedFlags(resumeText);

  return {
    atsScore,
    matchScore,
    strength,
    breakdown,
    matchedKeywords,
    missingKeywords,
    sections,
    suggestions,
    redFlags,
  };
};

module.exports = { analyzeResume };
