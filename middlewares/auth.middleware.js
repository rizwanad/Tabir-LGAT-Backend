import { errorResponse } from "../utils/response.js";
import { JWT_SECRET } from "../config/env.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authorize = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, "Not authorized", 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return errorResponse(res, "Unauthorized", 401);

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export default authorize;
