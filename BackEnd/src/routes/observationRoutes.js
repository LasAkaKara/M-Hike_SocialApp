const express = require("express");
const router = express.Router();
const observationController = require("../controllers/observationController");

// Observation CRUD
router.post("/", observationController.createObservation);
router.get("/", observationController.getPublicObservations);
router.get("/search", observationController.searchObservations);
router.get("/nearby", observationController.getNearbyObservations);
router.get("/trending", observationController.getTrendingObservations);
router.get("/hike/:hikeId", observationController.getObservationsByHike);
router.get("/user/:userId", observationController.getObservationsByUser);
router.get(
  "/user/:userId/following",
  observationController.getFollowingObservations
);
router.get("/:id", observationController.getObservationById);
router.put("/:id", observationController.updateObservation);
router.delete("/:id", observationController.deleteObservation);

// Community verification
router.post("/:id/confirm", observationController.confirmObservation);
router.post("/:id/dispute", observationController.disputeObservation);

module.exports = router;
