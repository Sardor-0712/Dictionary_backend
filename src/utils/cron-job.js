const cron = require("node-cron");

const {
  UploadController,
} = require("../controllers/upload/upload.controller.js");

cron.schedule("59 23 * * *", async () => {
  const data = await UploadController.deleteFileWithCron();
  console.info(
    `Cron job completed. Deleted files: ${data}! Date: ${new Date().toLocaleString()}`
  );
});
