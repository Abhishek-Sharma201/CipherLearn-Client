import { Router } from "express";
import { validateRequest } from "../../auth/validations.auth";
import { StudentValidations } from "./validation";
import StudentEnrollmentController from "./controller";

const router = Router();
const controller = new StudentEnrollmentController();

router.post(
  "/enroll",
  validateRequest(StudentValidations.enroll),
  controller.enrollSingle.bind(controller)
);

export default router;
