const { Router } = require("express");
const { uploadFile } = require("../../utils/file-upload.js");
const { UploadController } = require("../../controllers/upload/upload.controller.js");

const uploadRouter = Router();

uploadRouter.post("/", uploadFile.single("image"), UploadController.uploadFile);

module.exports = { uploadRouter };
