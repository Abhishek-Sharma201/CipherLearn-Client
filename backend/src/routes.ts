import { Router } from "express";
import authRoutes from "./modules/auth/routes.auth";
import dashboardRoutes from "./modules/dashboard/routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
