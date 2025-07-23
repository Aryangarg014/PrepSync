const express = require("express");
const userController = require("../controllers/userController");

const userRouter = express.Router();

// Public
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

// Protected
userRouter.get("/profile/:id", userController.getUserProfile);
userRouter.patch("/profile/:id", userController.updateUserProfile);
userRouter.delete("/profile/:id", userController.deleteUserProfile);

module.exports = userRouter;