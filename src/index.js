const express = require("express");
const { PORT } = require("./utils/secret.js");
const { main_router } = require("./routes/index.js");
const { ConnectDB } = require("./utils/config.database.js");
const { errorMiddleware } = require("./middlewares/error.middleware.js");
const cors = require("cors");
const app = express();
require("./utils/cron-job.js");

void ConnectDB();

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173", // dev uchun
    "https://dictionary-rpmy.onrender.com" // prod frontend uchun
  ],
  credentials: true
}));

app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
  res.status(200).json({ success: true, msg: "OK" });
});

main_router.forEach((value) => {
  app.use(value.path, value.router);
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`);
});
