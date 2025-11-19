const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const db = require("../configs/db");

class AuthService {
  // Hash password
  static hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  // Verify password
  static verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  // Generate JWT token
  static generateToken(userId, expiresIn = "7d") {
    return jwt.sign(
      { userId, iat: Math.floor(Date.now() / 1000) },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn }
    );
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    } catch (err) {
      return null;
    }
  }

  // Sign up user
  static async signUp(
    username,
    password,
    avatarUrl = null,
    bio = null,
    region = null
  ) {
    try {
      // Check if user already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        throw new Error("Username already exists");
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Hash password
      const passwordHash = this.hashPassword(password);

      // Create user with password hash
      const result = await db.query(
        `INSERT INTO users (username, avatarUrl, bio, region, passwordHash)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, avatarUrl, bio, region, createdAt`,
        [username, avatarUrl, bio, region, passwordHash]
      );

      const user = result.rows[0];

      // Generate token
      const token = this.generateToken(user.id);

      return {
        user,
        token,
        message: "User created successfully",
      };
    } catch (err) {
      throw err;
    }
  }

  // Sign in user
  static async signIn(username, password) {
    try {
      // Find user by username
      const result = await db.query(
        "SELECT id, username, avatarUrl, bio, region, passwordHash, createdAt FROM users WHERE username = $1",
        [username]
      );

      if (result.rows.length === 0) {
        throw new Error("Invalid username or password");
      }

      const user = result.rows[0];

      // Verify password
      if (!this.verifyPassword(password, user.passwordHash)) {
        throw new Error("Invalid username or password");
      }

      // Generate token
      const token = this.generateToken(user.id);

      // Remove password hash from response
      delete user.passwordHash;

      return {
        user,
        token,
        message: "Sign in successful",
      };
    } catch (err) {
      throw err;
    }
  }

  // Refresh token
  static async refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) {
        throw new Error("Invalid token");
      }

      const newToken = this.generateToken(decoded.userId);
      return { token: newToken };
    } catch (err) {
      throw err;
    }
  }

  // Change password
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      // Get user
      const result = await db.query(
        "SELECT passwordHash FROM users WHERE id = $1",
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      const user = result.rows[0];

      // Verify old password
      if (!this.verifyPassword(oldPassword, user.passwordHash)) {
        throw new Error("Invalid current password");
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }

      // Hash new password
      const newPasswordHash = this.hashPassword(newPassword);

      // Update password
      await db.query("UPDATE users SET passwordHash = $1 WHERE id = $2", [
        newPasswordHash,
        userId,
      ]);

      return { message: "Password changed successfully" };
    } catch (err) {
      throw err;
    }
  }

  // Reset password (generate reset token)
  static async requestPasswordReset(username) {
    try {
      const user = await User.findByUsername(username);
      if (!user) {
        throw new Error("User not found");
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = this.hashPassword(resetToken);
      const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      // Store reset token
      await db.query(
        `UPDATE users 
         SET resetTokenHash = $1, resetTokenExpiry = $2
         WHERE id = $3`,
        [resetTokenHash, resetTokenExpiry, user.id]
      );

      return {
        resetToken,
        message:
          "Password reset token generated. Use this token to reset your password.",
      };
    } catch (err) {
      throw err;
    }
  }

  // Reset password with token
  static async resetPassword(username, resetToken, newPassword) {
    try {
      const user = await User.findByUsername(username);
      if (!user) {
        throw new Error("User not found");
      }

      // Get reset token from database
      const result = await db.query(
        "SELECT resetTokenHash, resetTokenExpiry FROM users WHERE id = $1",
        [user.id]
      );

      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      const { resetTokenHash, resetTokenExpiry } = result.rows[0];

      // Check if token is valid
      if (!resetTokenHash || !this.verifyPassword(resetToken, resetTokenHash)) {
        throw new Error("Invalid reset token");
      }

      // Check if token is expired
      if (new Date() > new Date(resetTokenExpiry)) {
        throw new Error("Reset token has expired");
      }

      // Validate new password
      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }

      // Hash new password
      const newPasswordHash = this.hashPassword(newPassword);

      // Update password and clear reset token
      await db.query(
        `UPDATE users 
         SET passwordHash = $1, resetTokenHash = NULL, resetTokenExpiry = NULL
         WHERE id = $2`,
        [newPasswordHash, user.id]
      );

      return { message: "Password reset successfully" };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = AuthService;
