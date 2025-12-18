import { Router } from "express";
import { validateRequest } from "../../auth/validations.auth";
import { YoutubeVideoValidations } from "./validation";
import YoutubeVideoController from "./controller";

const router = Router();
const controller = new YoutubeVideoController();

router.post(
  "/upload",
  validateRequest(YoutubeVideoValidations.upload),
  controller.upload.bind(controller)
);

router.put("/:videoId", controller.draft.bind(controller));

export default router;
