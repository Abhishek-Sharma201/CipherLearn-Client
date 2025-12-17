import {
  AttendanceMethod,
  AttendanceStatus,
} from "../../../../prisma/generated/prisma/enums";

export type AttendanceSheet = {
  batchId: number;
  date: Date;
  attendanceRecords: Attendance[];
};

export type Attendance = {
  studentId: number;
  batchId: number;
  date: Date;
  time: Date;
  markedBy: string;
  method: AttendanceMethod;
  status: AttendanceStatus;
  attendanceSheetId?: number;
};

export type DayAttendanceResponse = {
  day: number;
  date: string;
  attendance: {
    id: number;
    status: string;
    method: string;
    markedBy?: string | null;
    time?: string | null;
    studentId: number;
  } | null;
};

export type AttendanceMatrixOptions = {
  month?: number | string;
  year?: number | string;
};
