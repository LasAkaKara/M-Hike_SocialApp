const ObservationComment = require("../models/ObservationComment");

// Get comment by ID
exports.getCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await ObservationComment.findById(id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(comment);
  } catch (err) {
    next(err);
  }
};

// Get comments for an observation
exports.getCommentsByObservation = async (req, res, next) => {
  try {
    const { observationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const comments = await ObservationComment.findByObservationId(
      observationId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// Get comments by user
exports.getCommentsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const comments = await ObservationComment.findByUserId(
      userId,
      parseInt(limit),
      parseInt(offset)
    );
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// Get recent comments
exports.getRecentComments = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const comments = await ObservationComment.getRecent(
      parseInt(limit),
      parseInt(offset)
    );
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

// Create comment
exports.createComment = async (req, res, next) => {
  try {
    const { observationId, userId, content } = req.body;

    if (!observationId || !userId || !content) {
      return res
        .status(400)
        .json({ error: "observationId, userId, and content are required" });
    }

    const comment = await ObservationComment.create({
      observationId,
      userId,
      content,
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// Update comment
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const comment = await ObservationComment.update(id, content);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(comment);
  } catch (err) {
    next(err);
  }
};

// Delete comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await ObservationComment.delete(id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted successfully", comment });
  } catch (err) {
    next(err);
  }
};

// Get comment count
exports.getCommentCount = async (req, res, next) => {
  try {
    const { observationId } = req.params;
    const count = await ObservationComment.getCommentCount(observationId);
    res.json({ observationId, commentCount: count });
  } catch (err) {
    next(err);
  }
};
