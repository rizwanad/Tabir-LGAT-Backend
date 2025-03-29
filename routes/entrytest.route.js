import { Router } from "express";
import {
  getTopics,
  getQuizByTopic,
  validatePurchaseCode,
  submitQuiz,
} from "../controllers/entrytest.controller.js";

const entryTestRouter = Router();

entryTestRouter.get("/topics", getTopics);
entryTestRouter.get("/:topicId", getQuizByTopic);
entryTestRouter.post("/validate-code", validatePurchaseCode);
entryTestRouter.post("/submit", submitQuiz);

export default entryTestRouter;
