const express = require("express");
const userRouter = require("./user.router");
const groupRouter = require("./group.router");
const goalRouter = require("./goal.router");
const mainRouter = express.Router();
const dashboardController = require("../controllers/dashboardController");

const authenticateUser = require("../middlewares/authMiddleware");

mainRouter.use("/users", userRouter);
mainRouter.use("/groups", authenticateUser, groupRouter);
mainRouter.use("/goals", authenticateUser, goalRouter);
mainRouter.get("/dashboard", authenticateUser, dashboardController.getDashboardData);

mainRouter.get("/", (req, res) => {
  res.send("server working");
});

module.exports = mainRouter;