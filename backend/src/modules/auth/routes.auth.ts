import { Router } from "express";
import AuthController from "./controller.auth";
import { AuthValidations, validateRequest } from "./validations.auth";
import { isAdmin, isAuthenticated } from "./middleware";

const router = Router();

const controller = new AuthController();

router.post(
  "/signup",
  // isAdmin,
  validateRequest(AuthValidations.signUp),
  controller.signup
);
router.post("/login", validateRequest(AuthValidations.login), controller.login);

router.put(
  "/profile",
  isAuthenticated,
  controller.updateProfile.bind(controller)
);

export default router;
