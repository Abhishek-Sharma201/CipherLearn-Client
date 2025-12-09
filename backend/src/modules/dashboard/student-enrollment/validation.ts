import joi from "joi";

const student = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  batch: joi.string().required(),
});

export const StudentValidations = {
  student: student,
};
