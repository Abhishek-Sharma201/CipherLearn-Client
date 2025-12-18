import { Prisma } from "../../../../prisma/generated/prisma/client";

export type YoutubeVideo = Omit<
  Prisma.YoutubeVideoCreateInput,
  "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedBy"
>;
