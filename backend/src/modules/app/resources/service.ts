import { Prisma } from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../config/db.config";
import { cacheService } from "../../../cache/index";
import { AppKeys } from "../../../cache/keys";
import { APP_VIDEOS, APP_NOTES, APP_MATERIALS } from "../../../cache/ttl";
import type {
  AppVideo,
  AppNote,
  AppStudyMaterial,
  AppResourceFile,
  AppResourceQuery,
} from "./types";

class ResourcesService {
  /**
   * Get videos for student's batch with optional search/category filters
   */
  async getVideos(
    batchId: number | null,
    limit?: number,
    query?: AppResourceQuery
  ): Promise<AppVideo[]> {
    if (!batchId) return [];

    const isFiltered = !!(query?.search || query?.category);

    const fetcher = async (): Promise<AppVideo[]> => {
      const where: Prisma.YoutubeVideoWhereInput = {
        batchId,
        isDeleted: false,
        visibility: { not: "PRIVATE" },
      };

      if (query?.search) {
        where.title = { contains: query.search, mode: "insensitive" };
      }

      if (query?.category) {
        where.category = query.category;
      }

      const videos = await prisma.youtubeVideo.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return videos.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        url: v.url,
        category: v.category,
        createdAt: v.createdAt?.toISOString() || new Date().toISOString(),
      }));
    };

    // Only cache unfiltered requests
    if (isFiltered) return fetcher();
    return cacheService.getOrSet(AppKeys.videos(batchId, limit), fetcher, APP_VIDEOS);
  }

  /**
   * Get notes for student's batch with optional search/category filters
   */
  async getNotes(
    batchId: number | null,
    limit?: number,
    query?: AppResourceQuery
  ): Promise<AppNote[]> {
    if (!batchId) return [];

    const isFiltered = !!(query?.search || query?.category);

    const fetcher = async (): Promise<AppNote[]> => {
      const where: Prisma.NoteWhereInput = {
        batchId,
        isDeleted: false,
      };

      if (query?.search) {
        where.title = { contains: query.search, mode: "insensitive" };
      }

      if (query?.category) {
        where.category = query.category;
      }

      const notes = await prisma.note.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        createdAt: n.createdAt?.toISOString() || new Date().toISOString(),
      }));
    };

    // Only cache unfiltered requests
    if (isFiltered) return fetcher();
    return cacheService.getOrSet(AppKeys.notes(batchId, limit), fetcher, APP_NOTES);
  }

  /**
   * Get study materials for student's batch with optional search/category filters
   */
  async getStudyMaterials(
    batchId: number | null,
    limit?: number,
    query?: AppResourceQuery
  ): Promise<AppStudyMaterial[]> {
    if (!batchId) return [];

    const isFiltered = !!(query?.search || query?.category);

    const fetcher = async (): Promise<AppStudyMaterial[]> => {
      const where: Prisma.StudyMaterialWhereInput = {
        batchId,
        isDeleted: false,
      };

      if (query?.search) {
        where.title = { contains: query.search, mode: "insensitive" };
      }

      if (query?.category) {
        where.category = query.category;
      }

      const materials = await prisma.studyMaterial.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return materials.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        files: (m.files as unknown as AppResourceFile[]) || [],
        category: m.category,
        createdAt: m.createdAt.toISOString(),
      }));
    };

    // Only cache unfiltered requests
    if (isFiltered) return fetcher();
    return cacheService.getOrSet(AppKeys.materials(batchId, limit), fetcher, APP_MATERIALS);
  }
}

export const resourcesService = new ResourcesService();
