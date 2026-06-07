// Simple validation middleware — keeps controllers clean.
// Usage: router.post('/login', validate(loginRules), loginController)

const loginRules = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.includes('@')) errors.push('Valid email is required');
  if (!password || password.length < 1) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0] });
  }
  next();
};

const signupRules = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || !email.includes('@')) errors.push('Valid email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0] });
  }
  next();
};

const profileRules = (req, res, next) => {
  const { name, email, password } = req.body;

  if (name !== undefined && name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
  }
  if (email !== undefined && !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email is required' });
  }
  if (password !== undefined && password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  next();
};

module.exports = { loginRules, signupRules, profileRules };
