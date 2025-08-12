const express = require("express");
const goalController = require("../controllers/goalController")

const goalRouter = express.Router();

// Protected
goalRouter.post("/create", goalController.createGoal);
goalRouter.get("/my-goals", goalController.getUserGoals);
goalRouter.get("/group/:id", goalController.getGoalsByGroup);
goalRouter.get("/:id", goalController.getGoalDetails);
goalRouter.patch("/:id/complete", goalController.markGoalComplete);
goalRouter.delete("/:id", goalController.deleteGoal);
goalRouter.patch("/:id", goalController.updateGoal);

module.exports = goalRouter;