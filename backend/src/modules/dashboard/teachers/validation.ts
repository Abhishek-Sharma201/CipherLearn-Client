import joi from "joi";

const create = joi.object({
  name: joi.string().min(2).max(100).required(),
  email: joi.string().email().required(),
});

const update = joi.object({
  name: joi.string().min(2).max(100).optional(),
  email: joi.string().email().optional(),
});

export const TeacherValidations = {
  create,
  update,
};
