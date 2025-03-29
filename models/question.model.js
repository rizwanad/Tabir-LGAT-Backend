import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const Question = mongoose.model("Question", questionSchema);

export default Question;
