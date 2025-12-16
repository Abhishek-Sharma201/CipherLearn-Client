import { Attendance, Prisma } from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../config/db.config";

export default class AttendanceService {
  async createAttendanceSheet(
    attendanceSheet: Omit<
      Prisma.AttendanceSheetCreateInput,
      "id" | "createdAt" | "updatedAt"
    >
  ) {
    try {
      const newAttendanceSheet = await prisma.attendanceSheet.create({
        data: attendanceSheet,
      });
      return newAttendanceSheet;
    } catch (error) {
      throw error;
    }
  }
  async markManualAttendance(
    attendance: Omit<
      Prisma.AttendanceCreateInput,
      "id" | "createdAt" | "updatedAt"
    >
  ) {
    try {
      const newAttendance = await prisma.attendance.create({
        data: attendance,
      });
      return newAttendance;
    } catch (error) {
      throw error;
    }
  }

  async getBatchAttendanceSheet(batchId: number): Promise<Attendance[]> {
    try {
      const attendanceSheets = await prisma.attendance.findMany({
        where: { batchId },
      });
      return attendanceSheets;
    } catch (error) {
      throw error;
    }
  }

  async getStudentAttendance(
    studentId: number
  ): Promise<
    Omit<
      Attendance,
      "attendanceSheetId" | "createdAt" | "updatedAt" | "batchId"
    >[]
  > {
    try {
      const attendanceRecords = await prisma.attendance.findMany({
        where: { studentId },
        select: {
          id: true,
          status: true,
          date: true,
          method: true,
          markedBy: true,
          time: true,
          studentId: true,
        },
      });
      return attendanceRecords as Attendance[];
    } catch (error) {
      throw error;
    }
  }

  async markQRAttendance() {}
}
