import { Prisma } from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../config/db.config";
import { User } from "../../auth/types.auth";
import { YoutubeVideo } from "./types";

export default class YoutubeVideoService {
  async upload(youtubeVideo: YoutubeVideo) {
    try {
      let select: Prisma.YoutubeVideoSelect = {
        id: true,
        title: true,
        url: true,
        description: true,
        visibility: true,
        category: true,
        batchId: true,
        createdAt: true,
      };

      const newYoutubeVideo = await prisma.youtubeVideo.create({
        data: youtubeVideo,
        select: select,
      });
      return newYoutubeVideo;
    } catch (error) {
      throw error;
    }
  }

  async getAll(batchId: number) {
    try {
      let select: Prisma.YoutubeVideoSelect = {
        id: true,
        title: true,
        url: true,
        description: true,
        visibility: true,
        createdAt: true,
      };
      const youtubeVideos = await prisma.youtubeVideo.findMany({
        where: { isDeleted: false, batchId: batchId },
        select: select,
      });
      return youtubeVideos;
    } catch (error) {
      throw error;
    }
  }

  async draft(id: number, user: User) {
    try {
      let existingVideo = await prisma.youtubeVideo.findUnique({
        where: { id },
      });

      if (!existingVideo) {
        throw new Error("Youtube video not found");
      }

      const draftedYoutubeVideo = await prisma.youtubeVideo.update({
        where: { id },
        data: { isDeleted: true, deletedBy: user.name, updatedAt: new Date() },
      });
      return !!draftedYoutubeVideo;
    } catch (error) {
      throw error;
    }
  }
}
