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

export type AttendanceMatrixOptions = {
  week?: number;
  month?: number;
  year?: number;
};
