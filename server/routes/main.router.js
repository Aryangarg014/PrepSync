const express = require("express");
const userRouter = require("./user.router");
const groupRouter = require("./group.router");
const mainRouter = express.Router();

mainRouter.use("/users", userRouter);
mainRouter.use("/groups", groupRouter);

mainRouter.get("/", (req, res) => {
  res.send("server working");
});

module.exports = mainRouter;