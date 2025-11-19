const AuthService = require("../services/authService");

// Sign up
exports.signUp = async (req, res, next) => {
  try {
    const { username, password, avatarUrl, bio, region } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const result = await AuthService.signUp(
      username,
      password,
      avatarUrl,
      bio,
      region
    );
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes("already exists")) {
      return res.status(409).json({ error: err.message });
    }
    if (err.message.includes("at least 6 characters")) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// Sign in
exports.signIn = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const result = await AuthService.signIn(username, password);
    res.json(result);
  } catch (err) {
    if (err.message.includes("Invalid")) {
      return res.status(401).json({ error: err.message });
    }
    next(err);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const result = await AuthService.refreshToken(token);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Old password and new password are required" });
    }

    const result = await AuthService.changePassword(
      userId,
      oldPassword,
      newPassword
    );
    res.json(result);
  } catch (err) {
    if (err.message.includes("Invalid") || err.message.includes("at least 6")) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const result = await AuthService.requestPasswordReset(username);
    res.json(result);
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { username, resetToken, newPassword } = req.body;

    if (!username || !resetToken || !newPassword) {
      return res.status(400).json({
        error: "Username, reset token, and new password are required",
      });
    }

    const result = await AuthService.resetPassword(
      username,
      resetToken,
      newPassword
    );
    res.json(result);
  } catch (err) {
    if (err.message.includes("Invalid") || err.message.includes("expired")) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const User = require("../models/User");
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};
