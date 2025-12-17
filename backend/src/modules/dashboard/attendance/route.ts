import { Router } from "express";
import AttendanceController from "./controller";
import { AttendanceValidations } from "./validation";
import { validateRequest } from "../../auth/validations.auth";

const router = Router();
const attendanceController = new AttendanceController();

router.post(
  "/create-attendance-sheet",
  validateRequest(AttendanceValidations.attendanceSheet.create),
  attendanceController.createAttendanceSheet.bind(attendanceController)
);

router.post(
  "/mark-attendance",
  validateRequest(AttendanceValidations.attendance.mark),
  attendanceController.markManualAttendance.bind(attendanceController)
);

router.get(
  "/batch-attendance-sheet/:batchId",
  attendanceController.getBatchAttendanceSheet.bind(attendanceController)
);

router.get(
  "/student-attendance-matrix/:studentId",
  attendanceController.getStudentAttendanceMatrix.bind(attendanceController)
);

export default router;
