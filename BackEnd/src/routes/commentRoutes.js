const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// Comment CRUD
router.post("/", commentController.createComment);
router.get("/recent", commentController.getRecentComments);
router.get(
  "/observation/:observationId",
  commentController.getCommentsByObservation
);
router.get(
  "/observation/:observationId/count",
  commentController.getCommentCount
);
router.get("/user/:userId", commentController.getCommentsByUser);
router.get("/:id", commentController.getCommentById);
router.put("/:id", commentController.updateComment);
router.delete("/:id", commentController.deleteComment);

module.exports = router;
