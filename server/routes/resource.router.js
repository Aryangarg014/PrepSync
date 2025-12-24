const express = require("express");
const resourceController = require("../controllers/resourceController");
const upload = require("../config/cloudinary");

const resourceRouter = express.Router();

resourceRouter.post(
    "/add",
    upload.single("resourceFile"),
    resourceController.addResource
);
resourceRouter.get("/group/:id", resourceController.getGroupResources);
resourceRouter.delete("/:resourceId/group/:groupId", resourceController.deleteResource);
resourceRouter.get("/download/:id", resourceController.downloadResource);

module.exports = resourceRouter;