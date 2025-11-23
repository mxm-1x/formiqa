import { Router } from "express";
import {submitFeedback} from "../controllers/feedbackController";

const router = Router()

router.post("/:code", submitFeedback);

export default router;