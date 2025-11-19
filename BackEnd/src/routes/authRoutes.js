const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes
router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.post("/refresh-token", authController.refreshToken);
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.get("/me", authMiddleware.verifyToken, authController.getCurrentUser);
router.post(
  "/change-password",
  authMiddleware.verifyToken,
  authController.changePassword
);

module.exports = router;
