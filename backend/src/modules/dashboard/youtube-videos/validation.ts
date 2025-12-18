import Joi from "joi";
import { YoutubeVideoVisibility } from "../../../../prisma/generated/prisma/enums";

const upload = Joi.object({
  title: Joi.string().max(150).required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  visibility: Joi.string()
    .valid(
      YoutubeVideoVisibility.PRIVATE,
      YoutubeVideoVisibility.PUBLIC,
      YoutubeVideoVisibility.UNLISTED
    )
    .required(),
  url: Joi.string().uri().required(),
});

export const YoutubeVideoValidations = {
  upload: upload,
};
