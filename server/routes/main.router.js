const express = require("express");
const userRouter = require("./user.router");
const mainRouter = express.Router();

mainRouter.use("/users", userRouter);

mainRouter.get("/", (req, res) => {
  res.send("server working");
});

module.exports = mainRouter;