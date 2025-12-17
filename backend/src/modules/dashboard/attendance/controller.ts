import type { Request, Response } from "express";
import { Prisma } from "../../../../prisma/generated/prisma/client";
import AttendanceService from "./service";
import { AttendanceMatrixOptions } from "./types";

const attendanceService = new AttendanceService();

export default class AttendanceController {
  async createAttendanceSheet(req: Request, res: Response) {
    try {
      const data: Prisma.AttendanceSheetCreateInput = req.body;
      const attendanceSheet = await attendanceService.createAttendanceSheet(
        data
      );

      return res.status(201).json({
        success: true,
        message: "Attendance sheet created successfully",
        data: attendanceSheet,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: `Internal Server Error: ${error}` });
    }
  }
  async markManualAttendance(req: Request, res: Response) {
    try {
      const data: Prisma.AttendanceCreateInput = req.body;
      const attendance = await attendanceService.markManualAttendance(data);
      return res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
        data: attendance,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: `Internal Server Error: ${error}` });
    }
  }
  async getBatchAttendanceSheet(req: Request, res: Response) {
    try {
      const batchId = Number(req.params.batchId);
      const attendanceSheets = await attendanceService.getBatchAttendanceSheet(
        batchId
      );
      return res.status(200).json({
        success: true,
        message: "Attendance sheets fetched successfully",
        data: attendanceSheets,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: `Internal Server Error: ${error}` });
    }
  }
  async getStudentAttendanceMatrix(req: Request, res: Response) {
    try {
      const studentId = Number(req.params.studentId);
      if (!studentId || Number.isNaN(studentId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid studentId" });
      }

      const monthQ = req.query.month as string | undefined;
      const yearQ = req.query.year as string | undefined;

      const month = monthQ ? Number(monthQ) : undefined;
      const year = yearQ ? Number(yearQ) : undefined;

      const result = await attendanceService.getStudentAttendanceMatrix(
        studentId,
        { month, year }
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("getStudentAttendanceHandler error:", error);
      return res
        .status(500)
        .json({ success: false, message: String(error.message ?? error) });
    }
  }

  async markQRAttendance(req: Request, res: Response) {}
}
