import Topic from "../models/topic.model.js";
import Question from "../models/question.model.js";
import PurchaseCode from "../models/purchasecode.model.js";
import TestResult from "../models/testresult.model.js";
import { errorResponse, successResponse } from "../utils/response.js";
import axios from 'axios';
import { PYTHON_BACKEND_API } from '../config/env.js';


/**
 * Get All Topics
 */
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find();

    return successResponse(res, "Topics fetched", { topics });
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
}

/**
 * Get Quiz Questions by Topic
 */
export const getQuizByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await Topic.findById(topicId);

    if (!topic) {
      return errorResponse(res, "Topic not found", 404);
    }

    // const questions = await Question.find({ topic: topicId });

      // const { count = 5 } = req.query;
      const count = 5

      // Fetch random questions from the external API
      const response = await axios.get(`${PYTHON_BACKEND_API}/random-test?questions=${count}`);

      if (!response.data || !response.data.sections) {
        return errorResponse(res, "Invalid response from question generator API", 500);
      }


      const formattedQuestions = [];

    response.data.sections.forEach(section => {
      section.questions.forEach(question => {
        formattedQuestions.push({
          id: question.question_id,
          text: question.question_text,
          type: question.question_type,
          category: question.category,
          difficulty: question.difficulty,
          options: question.options.map(option => ({
            id: option.option_id,
            text: option.option_text
          })),
          correctAnswer: question.correct_answer,
          section: section.section_name,
          section_id:section.section_id
        });
      });
    });

    return successResponse(res, "Quiz questions fetched successfully", {
      quizId: response.data.test_id,
      quizName: response.data.test_name,
      description: response.data.description,
      questions: formattedQuestions
    });
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Validate Purchase Code Before Starting Quiz
 */
export const validatePurchaseCode = async (req, res) => {
  try {
    const { code } = req.body;

    const purchaseCode = await PurchaseCode.findOne({ code });

    if (!purchaseCode) {
      return errorResponse(res, "Invalid purchase code", 400);
    }

    if (purchaseCode.isUsed) {
      return errorResponse(res, "Purchase code already used", 400);
    }

    return successResponse(res, "Purchase code is valid", {});
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Submit Quiz Answers and Store Result
 */
export const submitQuiz = async (req, res) => {
  try {
    const { test_id, sections, purchaseCode } = req.body;

    if (!test_id || !sections || !Array.isArray(sections)) {
      return errorResponse(res, "Invalid submission data", 400);
    }

    // Process purchase code if provided
    let purchaseCodeStatus = null;
    if (purchaseCode) {
      // Validate purchase code
      purchaseCodeStatus = {
        isValid: true,
        message: "Quiz submitted and evaluated successfully"
      };

      // In your actual implementation, you would do something like:
      const purchaseCodeDoc = await PurchaseCode.findOne({ code: purchaseCode });
      if (!purchaseCodeDoc || purchaseCodeDoc.isUsed) {
        return errorResponse(res, "Invalid or already used purchase code", 400);
      }
      purchaseCodeDoc.isUsed = true;
      await purchaseCodeDoc.save();
    }

    console.log("Evaluation Response:", test_id,
      sections);

    try {
      const evaluationResponse = await axios.post(
        `${PYTHON_BACKEND_API}/evaluate-test`,
        {
          test_id,
          sections
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("Testing Response:", evaluationResponse);


      const analysisResponse = await axios.post(
        `${PYTHON_BACKEND_API}/analyze-test`,
        {
          test_id,
          sections
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Combine the evaluation and analysis results
      const combinedResponse = {
        purchaseCodeStatus,
        ...evaluationResponse.data,
        analysis: analysisResponse.data
      };

      // Return the combined results
      return successResponse(res, "Quiz submitted and evaluated successfully", combinedResponse);

    } catch (error) {
      console.error("Error in API calls:", error.message);

      if (error.response) {
        console.error("API response error:", error.response.data);
      }

      // Fallback to a simple evaluation if the external APIs fail
      const totalQuestions = sections.reduce((sum, section) =>
        sum + section.questions.length, 0);

      // Generate mock section results for the fallback
      const mockSectionResults = {};
      sections.forEach(section => {
        mockSectionResults[section.section_id] = {
          total_questions: section.questions.length,
          attempted: section.questions.length,
          correct: 0,
          score: 0
        };
      });

      return successResponse(res, "Quiz evaluated with fallback method due to API error", {
        test_id,
        total_questions: totalQuestions,
        correct_answers: 0,
        total_score: 0,
        section_results: mockSectionResults,
        error_details: error.message
      });
    }

  } catch (error) {
    console.error("Error submitting quiz:", error);
    return errorResponse(res, "Failed to process quiz submission", 500);
  }
};
