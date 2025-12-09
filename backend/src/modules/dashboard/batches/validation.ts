import Joi from "joi";

const batch = Joi.object({
  name: Joi.string().required(),
});

export const BatchValidations = {
  batch: batch,
};
