import { errorResponse } from "../utils/response.js";

const errorMiddleware = (err, req, res, next) => {

  // Handle Sequelize Errors
  if (err.name === "SequelizeUniqueConstraintError") {
    return errorResponse(res, "Duplicate entry detected. Email must be unique.", 400);
  }
  if (err.name === "SequelizeValidationError") {
    return errorResponse(res, err.errors.map(e => e.message).join(", "), 400);
  }
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return errorResponse(res, "Cannot delete: This record is referenced elsewhere", 400);
  }

  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, "Invalid token, authorization denied", 401);
  }
  if (err.name === "TokenExpiredError") {
    return errorResponse(res, "Token expired, please log in again", 401);
  }

  return errorResponse(res, err.message || "Internal Server Error", err.status || 500);
};

export default errorMiddleware;
