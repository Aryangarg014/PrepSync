const express = require("express");
const userController = require("../controllers/userController");

const userRouter = express.Router();

// Public
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);

// Protected
userRouter.get("/me", userController.getCurrentUser);
// userRouter.get("/profile", userController.getUserProfile);
userRouter.patch("/me", userController.updateUserProfile);
userRouter.delete("/me", userController.deleteUserProfile);

module.exports = userRouter;