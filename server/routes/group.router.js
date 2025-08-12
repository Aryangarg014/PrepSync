const express = require("express");
const groupController = require("../controllers/groupController");

const groupRouter = express.Router();

// Protected
groupRouter.post("/create", groupController.createGroup);
groupRouter.post("/join/:id", groupController.joinGroup);
groupRouter.post("/leave/:id", groupController.leaveGroup);
groupRouter.get("/my-groups", groupController.getUserGroups);
groupRouter.get("/:id", groupController.getGroupDetails);
groupRouter.delete("/:id", groupController.deleteGroup);

module.exports = groupRouter;