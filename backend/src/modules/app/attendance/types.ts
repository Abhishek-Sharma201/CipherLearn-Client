import { AttendanceStatus, AttendanceMethod } from "../../../../prisma/generated/prisma/client";

export interface MonthlyAttendance {
  month: string;
  year: number;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

export interface RecentAttendance {
  date: string;
  status: AttendanceStatus;
  markedBy?: string;
  method: AttendanceMethod;
  subject?: string;
  reason?: string;
  time?: string;
}

export interface AttendancePerformance {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  attendancePercentage: number;
  statusLabel: string;
  monthlyBreakdown: MonthlyAttendance[];
  recentAttendance: RecentAttendance[];
}

export interface QRAttendanceResult {
  success: boolean;
  message: string;
}

export interface AttendanceCalendarDay {
  date: string;
  status: AttendanceStatus;
  subject?: string;
}

export interface AttendanceHistoryQuery {
  month?: number;
  year?: number;
  status?: AttendanceStatus;
}

// ─── Teacher-side Types ───────────────────────────────────────────────────────

export interface TeacherBatchStudent {
  id: number;
  fullname: string;
  email: string;
}

export interface MarkAttendanceRecord {
  studentId: number;
  status: "PRESENT" | "ABSENT" | "LATE";
  reason?: string;
}

export interface MarkAttendanceInput {
  batchId: number;
  date: string;        // YYYY-MM-DD
  records: MarkAttendanceRecord[];
}

export interface AttendanceReportEntry {
  date: string;        // YYYY-MM-DD
  submittedBy: string;
  submittedAt: string; // ISO timestamp of earliest record
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
}
