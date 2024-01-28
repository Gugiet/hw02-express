// const {isValidObjectId} = require("mongoose");
import isValidObjectId from "mongoose";

// const {HttpError} = require("../helpers");
import HttpError from "../helpers";

const isValidId = (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    next(HttpError(400, `${id} is not valid id`));
  }
  next();
};

module.exports = isValidId;
