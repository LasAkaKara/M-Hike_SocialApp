const AuthService = require("../services/authService");

// Verify JWT token
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Optional token verification (doesn't fail if no token)
exports.optionalToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = AuthService.verifyToken(token);
      if (decoded) {
        req.userId = decoded.userId;
      }
    }

    next();
  } catch (err) {
    next();
  }
};

// Verify user owns resource
exports.verifyOwnership = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const resourceUserId = parseInt(req.params.userId || req.body.userId);
    if (decoded.userId !== resourceUserId) {
      return res
        .status(403)
        .json({
          error: "Unauthorized: You can only modify your own resources",
        });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Rate limiting middleware
exports.rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    const recentRequests = userRequests.filter((time) => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res
        .status(429)
        .json({ error: "Too many requests, please try again later" });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);

    next();
  };
};

// Validate request body
exports.validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => !req.body[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    next();
  };
};

// Validate query parameters
exports.validateQuery = (requiredParams) => {
  return (req, res, next) => {
    const missing = requiredParams.filter((param) => !req.query[param]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required parameters: ${missing.join(", ")}`,
      });
    }

    next();
  };
};
