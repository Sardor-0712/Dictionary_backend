const { validationResult } = require("express-validator");
const { HttpException } = require("../utils/http-exception.js");
const { StatusCodes } = require("http-status-codes");

const expressValidate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  let messages = "";

  errors.array().map((err) => {
    messages += err.msg + " ";
  });

  throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, messages.trim());
};

module.exports = { expressValidate };
