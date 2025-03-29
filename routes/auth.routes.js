import { Router } from "express";
import { signIn, createTopic, signUp, addQuestion, generatePurchaseCode, getPurchaseCodes } from "../controllers/auth.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const authRouter = Router()

authRouter.post('/sign-up',signUp)

authRouter.post('/sign-in', signIn)


authRouter.post("/topics", authorize, createTopic);
authRouter.post("/questions", authorize, addQuestion);
authRouter.post("/generate-code", authorize, generatePurchaseCode);
authRouter.get('/codes', authorize, getPurchaseCodes)


export default authRouter
