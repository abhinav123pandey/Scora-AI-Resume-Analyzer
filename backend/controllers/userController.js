const User = require('../models/User');

// GET /api/user/profile
// Returns the logged-in user's profile (req.user set by auth middleware)
const getProfile = async (req, res) => {
  try {
    const user = req.user; // already attached by auth middleware
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/user/profile
// Updates name and/or email and/or password
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      user.password = password; // pre-save hook hashes it automatically
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
