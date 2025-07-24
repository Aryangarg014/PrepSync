const express = require("express");
const userController = require("../controllers/userController");

const userRouter = express.Router();

const authenticateUser = require("../middlewares/authMiddleware");

// Public
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

// Protected
userRouter.get("/profile/:id", authenticateUser, userController.getUserProfile);
userRouter.patch("/profile/:id", authenticateUser, userController.updateUserProfile);
userRouter.delete("/profile/:id", authenticateUser, userController.deleteUserProfile);

module.exports = userRouter;