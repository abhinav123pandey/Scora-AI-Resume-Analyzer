const express = require('express');
const router = express.Router();
const { googleAuth, signup, login } = require('../controllers/authController');
const { signupRules, loginRules } = require('../middleware/validate');

router.post('/google', googleAuth);
router.post('/signup', signupRules, signup);
router.post('/login', loginRules, login);

module.exports = router;
