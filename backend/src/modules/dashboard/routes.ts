import { Router } from "express";

const router = Router();

router.use("/analytics");
router.use("/attendance");
router.use("/batches");
router.use("/fees");
router.use("/notes");
router.use("/student-enrollment");
router.use("/youtube-videos");

export default router;
