const { connect } = require("mongoose");
const { MONGO_URI } = require("./secret");

const ConnectDB = async () => {
  await connect(MONGO_URI);
  console.log("Connect DB!");
};

module.exports = { ConnectDB };
