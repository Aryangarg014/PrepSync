const express = require("express");
const userRouter = require("./user.router");
const groupRouter = require("./group.router");
const goalRouter = require("./goal.router");
const resourceRouter = require("../routes/resource.router");
const dashboardController = require("../controllers/dashboardController");
const mongoose = require("mongoose");

const mainRouter = express.Router();

const authenticateUser = require("../middlewares/authMiddleware");

mainRouter.get("/dashboard", authenticateUser, dashboardController.getDashboardData);

mainRouter.use("/users", userRouter);
mainRouter.use("/groups", authenticateUser, groupRouter);
mainRouter.use("/goals", authenticateUser, goalRouter);
mainRouter.use("/resources", authenticateUser, resourceRouter);

mainRouter.get("/", (req, res) => {
  res.send("server working");
});

// Lightweight health check for uptime monitoring (used by cron pingers)
mainRouter.get("/health", (req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const dbState = states[mongoose.connection.readyState] || "unknown";
  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: dbState,
  });
});

module.exports = mainRouter;