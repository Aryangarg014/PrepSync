const express = require("express");
const userRouter = require("./user.router");
const groupRouter = require("./group.router");
const goalRouter = require("./goal.router");
const resourceRouter = require("../routes/resource.router");
const dashboardController = require("../controllers/dashboardController");

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

module.exports = mainRouter;