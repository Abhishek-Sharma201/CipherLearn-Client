import joi from "joi";

const enroll = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  batchId: joi.number().required(),
  firstname: joi.string().required(),
  lastname: joi.string().required(),
  middlename: joi.string().allow(null, '').optional(),
  dob: joi.string().required(),
  address: joi.string().required(),
});

export const StudentValidations = {
  enroll: enroll,
};
