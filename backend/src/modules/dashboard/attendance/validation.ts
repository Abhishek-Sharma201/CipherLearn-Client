import Joi from "joi";
import {
  AttendanceMethod,
  AttendanceStatus,
} from "../../../../prisma/generated/prisma/enums";

const createAttendanceSheet = Joi.object({
  batchId: Joi.number().required(),
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().min(2000).required(),
  attendance: Joi.array()
    .items(
      Joi.object({
        studentId: Joi.number().required(),
        status: Joi.string().valid(AttendanceStatus).required(),
        batchId: Joi.number().required(),
        date: Joi.date().required(),
        markedBy: Joi.string().required(),
        markedById: Joi.number().required(),
        method: Joi.string().valid(AttendanceMethod).required(),
      })
    )
    .optional(),
});

const markAttendance = Joi.object({
  studentId: Joi.number().required(),
  batchId: Joi.number().required(),
  date: Joi.date().required(),
  markedBy: Joi.string().required(),
  markedById: Joi.number().required(),
  method: Joi.string().valid(AttendanceMethod).required(),
  status: Joi.string().valid(AttendanceStatus).required(),
});

export const AttendanceValidations = {
  attendanceSheet: {
    create: createAttendanceSheet,
  },
  attendance: {
    mark: markAttendance,
  },
};
