const { config } = require("dotenv");
config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_URL = process.env.AWS_URL;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

module.exports = {
  PORT,
  MONGO_URI,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_URL,
  AWS_REGION,
  AWS_BUCKET_NAME,
};
