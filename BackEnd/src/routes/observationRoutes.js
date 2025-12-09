const express = require("express");
const router = express.Router();
const observationController = require("../controllers/observationController");

// Observation CRUD - Keep only essential endpoints
router.post("/", observationController.createObservation); // Create observation
router.get("/hike/:hikeId", observationController.getObservationsByHike); // Get observations for a hike

module.exports = router;
