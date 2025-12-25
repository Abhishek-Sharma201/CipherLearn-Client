import { Request, Response } from "express";
import { YoutubeVideo } from "./types";
import YoutubeVideoService from "./service";

const youtubeVideoService = new YoutubeVideoService();

export default class YoutubeVideoController {
  async upload(req: Request, res: Response) {
    try {
      const {
        title,
        url,
        description,
        visibility,
        batchId,
        category,
      }: YoutubeVideo = req.body;

      const youtubeVideo = await youtubeVideoService.upload({
        title,
        url,
        description,
        visibility,
        batchId,
        category,
      });

      return res.status(201).json({ success: true, data: youtubeVideo });
    } catch (error) {
      return res.status(500).json({ error: `Internal Server Error: ${error}` });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      // Get batchId from query parameter (optional)
      const batchIdStr = req.query.batchId as string | undefined;
      const batchId = batchIdStr ? Number(batchIdStr) : undefined;

      const youtubeVideos = await youtubeVideoService.getAll(batchId);
      return res.status(200).json({ success: true, data: youtubeVideos });
    } catch (error) {
      return res.status(500).json({ error: `Internal Server Error: ${error}` });
    }
  }

  async draft(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const draftedVideo = await youtubeVideoService.draft(
        Number(videoId),
        user
      );
      return res.status(200).json({ success: true, data: draftedVideo });
    } catch (error) {
      return res.status(500).json({ error: `Internal Server Error: ${error}` });
    }
  }
}
