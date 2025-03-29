import User from "../models/user.model.js";
import Topic from "../models/topic.model.js";
import Question from "../models/question.model.js";
import PurchaseCode from "../models/purchasecode.model.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const signUp = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password } = req.body;

    // Check if admin already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, "Admin already exists", 400);
    }

    const user = new User({ email, password });
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return successResponse(res, "Admin registered successfully!", { user });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, error.message, 400);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const token = generateToken(user.id);
    return successResponse(res, "User logged in successfully", { user, token });

  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const createTopic = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if topic already exists
    const existingTopic = await Topic.findOne({ name });
    if (existingTopic) {
      return errorResponse(res, "Topic already exists", 400);
    }

    const topic = new Topic({ name, description});
    await topic.save();

    return successResponse(res, "Topic created successfully!", { topic });

  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const addQuestion = async (req, res) => {
  try {
    const { topicId, text, options, correctAnswer } = req.body;

    console.log("Received topicId:", topicId);
    console.log("Is valid ObjectId?", mongoose.Types.ObjectId.isValid(topicId));


    // Convert topicId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return errorResponse(res, "Invalid topic ID", 400);
    }

    const topic = await Topic.findById(new mongoose.Types.ObjectId(topicId));
    if (!topic) {
      return errorResponse(res, "Topic not found", 404);
    }

    const question = new Question({ topic: topicId, text, options, correctAnswer });
    await question.save();

    return successResponse(res, "Question added successfully!", { question });

  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const generatePurchaseCode = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let code;
    let isUnique = false;

    while (!isUnique) {
      code = Math.random().toString(36).substr(2, 8).toUpperCase();
      const existingCode = await PurchaseCode.findOne({ code }).session(session);
      if (!existingCode) isUnique = true;
    }

    const purchaseCode = new PurchaseCode({ code });
    await purchaseCode.save({ session });

    await session.commitTransaction();
    session.endSession();

    return successResponse(res, "Purchase code generated successfully!", { purchaseCode });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return errorResponse(res, error.message, 400);
  }
};

export const getPurchaseCodes = async (req, res) => {


  try {

    const purchaseCodes = await PurchaseCode.find().sort({ createdAt: -1 });
    return successResponse(res, "All generated Purchase code ", { purchaseCodes });

  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
