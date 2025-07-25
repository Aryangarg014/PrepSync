const express = require("express");
const groupController = require("../controllers/groupController");

const groupRouter = express.Router();

const authenticateUser = require("../middlewares/authMiddleware");

// Protected
groupRouter.post("/create", authenticateUser, groupController.createGroup);
groupRouter.post("/join/:id", authenticateUser, groupController.joinGroup);
groupRouter.get("/my-groups", authenticateUser, groupController.getUserGroups);
groupRouter.get("/:id", authenticateUser, groupController.getGroupDetails);
groupRouter.delete("/:id", authenticateUser, groupController.deleteGroup);

module.exports = groupRouter;