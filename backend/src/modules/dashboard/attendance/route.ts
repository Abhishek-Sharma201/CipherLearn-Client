import { Router } from "express";
import AttendanceController from "./controller";

const router = Router();
const attendanceController = new AttendanceController();

router.post(
  "/create-attendance-sheet",
  attendanceController.createAttendanceSheet
);

router.post("/mark-attendance", attendanceController.markManualAttendance);

export default router;
