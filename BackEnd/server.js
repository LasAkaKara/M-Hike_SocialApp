require("dotenv").config();
const app = require("./src/app");
const { initializeDatabase } = require("./src/configs/db");

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    console.log("Initializing database...");
    await initializeDatabase();
    console.log("Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
