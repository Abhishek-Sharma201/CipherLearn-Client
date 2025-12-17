import {
  Attendance,
  AttendanceMethod,
  Prisma,
} from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../config/db.config";
import { AttendanceMatrixOptions, DayAttendanceResponse } from "./types";

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
        data: { ...attendance, method: AttendanceMethod.MANUAL },
      });
      return newAttendance;
    } catch (error) {
      throw error;
    }
  }
  async getBatchAttendanceSheet(batchId: number): Promise<Attendance[]> {
    try {
      let batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        throw new Error("Batch not found");
      }

      const attendanceSheets = await prisma.attendance.findMany({
        where: { batchId },
      });
      return attendanceSheets;
    } catch (error) {
      throw error;
    }
  }
  async getStudentAttendanceMatrix(
    studentId: number,
    opts: AttendanceMatrixOptions = {}
  ): Promise<{
    month: { month: number; days: DayAttendanceResponse[] };
    year: number;
  }> {
    const now = new Date();
    const defaultMonth = now.getUTCMonth() + 1;
    const defaultYear = now.getUTCFullYear();

    const monthNum = toIntOrDefault(opts.month, defaultMonth);
    const yearNum = toIntOrDefault(opts.year, defaultYear);

    if (monthNum < 1 || monthNum > 12) {
      throw new Error("Invalid month. Use 1..12");
    }

    const { start, end } = getMonthRangeInUTC(yearNum, monthNum);

    const attendanceRows = await prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: start,
          lt: end,
        },
      },
      select: {
        id: true,
        status: true,
        date: true,
        method: true,
        markedBy: true,
        time: true,
        studentId: true,
      },
      orderBy: { date: "asc" },
    });

    const map = new Map<string, any>();
    const tzOffsetMinutes = 5 * 60 + 30;
    for (const r of attendanceRows) {
      const localMs = r.date.getTime() + tzOffsetMinutes * 60 * 1000;
      const localDate = new Date(localMs).toISOString().slice(0, 10);
      map.set(localDate, r);
    }

    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

    const days: DayAttendanceResponse[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const localDateStr = new Date(Date.UTC(yearNum, monthNum - 1, d))
        .toISOString()
        .slice(0, 10);
      const localMidnightUtcMs =
        Date.UTC(yearNum, monthNum - 1, d) - tzOffsetMinutes * 60 * 1000;
      const localMidnightLocalStr = new Date(
        localMidnightUtcMs + tzOffsetMinutes * 60 * 1000
      )
        .toISOString()
        .slice(0, 10);
      const yyyy = String(yearNum).padStart(4, "0");
      const mm = String(monthNum).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;

      const rec = map.get(key) ?? null;

      days.push({
        day: d,
        date: key,
        attendance: rec
          ? {
              id: rec.id,
              status: String(rec.status),
              method: String(rec.method),
              markedBy: rec.markedBy ?? null,
              time: rec.time ?? null,
              studentId: rec.studentId,
            }
          : null,
      });
    }

    return {
      month: {
        month: monthNum,
        days,
      },
      year: yearNum,
    };
  }
  async markQRAttendance() {}
}
