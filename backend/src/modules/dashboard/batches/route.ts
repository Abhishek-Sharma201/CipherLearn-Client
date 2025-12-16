import { Router } from "express";
import BatchController from "./controller";
import { isAdmin, isAuthenticated } from "../../auth/middleware";
import { validateRequest } from "../../auth/validations.auth";
import { BatchValidations } from "./validation";

const router = Router();
const controller = new BatchController();

router.post(
  "/",
  isAuthenticated,
  validateRequest(BatchValidations.batch),
  controller.create.bind(controller)
);
router.put("/:id", isAuthenticated, controller.update.bind(controller));
router.get("/", isAuthenticated, controller.getAll.bind(controller));
router.post("/draft", isAuthenticated, controller.draft.bind(controller));
router.get("/drafts", isAuthenticated, controller.getDrafts.bind(controller));
router.delete("/", isAuthenticated, controller.delete.bind(controller));

export default router;
