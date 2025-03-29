import mongoose from "mongoose";


const testResultSchema = new mongoose.Schema({
  purchaseCode: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseCode", required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
  answers: [{ questionId: String, selectedAnswer: String }],
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TestResult = mongoose.model("TestResult", testResultSchema);

export default TestResult;
