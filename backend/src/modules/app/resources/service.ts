import { Prisma } from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../config/db.config";
import { cacheService } from "../../../cache/index";
import { AppKeys, InvalidationPatterns } from "../../../cache/keys";
import { APP_VIDEOS, APP_NOTES, APP_MATERIALS } from "../../../cache/ttl";
import type {
  AppVideo,
  AppNote,
  AppStudyMaterial,
  AppResourceFile,
  AppResourceQuery,
  TeacherMaterialListItem,
  CreateMaterialInput,
  UpdateMaterialInput,
  GetTeacherMaterialsQuery,
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

  // ==================== TEACHER METHODS ====================

  /**
   * Get teacher's own study materials with tab filtering.
   * Tabs: published | drafts | scheduled
   */
  async getTeacherMaterials(
    teacherId: number,
    query: GetTeacherMaterialsQuery
  ): Promise<{ materials: TeacherMaterialListItem[]; pagination: object }> {
    const { tab = "published", subject, batchId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.StudyMaterialWhereInput = {
      teacherId,
      isDeleted: false,
    };

    if (batchId) where.batchId = batchId;
    if (subject) where.subject = { contains: subject, mode: "insensitive" };

    if (tab === "published") {
      where.materialStatus = "PUBLISHED";
    } else if (tab === "drafts") {
      where.materialStatus = "DRAFT";
    } else if (tab === "scheduled") {
      where.materialStatus = "SCHEDULED";
      where.scheduledAt = { gt: now };
    }

    const [materials, total] = await Promise.all([
      prisma.studyMaterial.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { batch: { select: { id: true, name: true } } },
      }),
      prisma.studyMaterial.count({ where }),
    ]);

    const items: TeacherMaterialListItem[] = materials.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      subject: m.subject,
      chapter: m.chapter,
      materialType: m.materialType,
      materialStatus: m.materialStatus,
      scheduledAt: m.scheduledAt?.toISOString() ?? null,
      files: (m.files as unknown as AppResourceFile[]) || [],
      batchId: m.batchId,
      batchName: m.batch.name,
      visibleBatchIds: m.visibleBatchIds,
      createdAt: m.createdAt.toISOString(),
    }));

    return {
      materials: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Upload a new study material (files already uploaded to Cloudinary by controller).
   */
  async createTeacherMaterial(
    teacherId: number,
    teacherName: string,
    input: CreateMaterialInput,
    files: AppResourceFile[]
  ): Promise<TeacherMaterialListItem> {
    if (files.length === 0) {
      throw new Error("At least one file must be uploaded");
    }

    const material = await prisma.studyMaterial.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() ?? null,
        subject: input.subject?.trim() ?? null,
        chapter: input.chapter?.trim() ?? null,
        materialType: (input.materialType as Prisma.StudyMaterialCreateInput["materialType"]) ?? "DOCUMENT",
        materialStatus: (input.materialStatus as Prisma.StudyMaterialCreateInput["materialStatus"]) ?? "PUBLISHED",
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        files: files as unknown as Prisma.InputJsonValue,
        batchId: input.batchId,
        teacherId,
        visibleBatchIds: input.visibleBatchIds ?? [],
        createdBy: teacherName,
      },
      include: { batch: { select: { id: true, name: true } } },
    });

    // Invalidate student material cache for affected batches
    cacheService.delByPrefix(InvalidationPatterns.appResources);

    return {
      id: material.id,
      title: material.title,
      description: material.description,
      subject: material.subject,
      chapter: material.chapter,
      materialType: material.materialType,
      materialStatus: material.materialStatus,
      scheduledAt: material.scheduledAt?.toISOString() ?? null,
      files,
      batchId: material.batchId,
      batchName: material.batch.name,
      visibleBatchIds: material.visibleBatchIds,
      createdAt: material.createdAt.toISOString(),
    };
  }

  /**
   * Update a study material (teacher must own it).
   */
  async updateTeacherMaterial(
    materialId: number,
    teacherId: number,
    input: UpdateMaterialInput
  ): Promise<TeacherMaterialListItem> {
    const existing = await prisma.studyMaterial.findFirst({
      where: { id: materialId, teacherId, isDeleted: false },
    });

    if (!existing) {
      throw new Error("Material not found or access denied");
    }

    const material = await prisma.studyMaterial.update({
      where: { id: materialId },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.description !== undefined && {
          description: input.description?.trim() ?? null,
        }),
        ...(input.subject !== undefined && { subject: input.subject?.trim() ?? null }),
        ...(input.chapter !== undefined && { chapter: input.chapter?.trim() ?? null }),
        ...(input.materialType !== undefined && {
          materialType: input.materialType as Prisma.StudyMaterialUpdateInput["materialType"],
        }),
        ...(input.materialStatus !== undefined && {
          materialStatus: input.materialStatus as Prisma.StudyMaterialUpdateInput["materialStatus"],
        }),
        ...(input.scheduledAt !== undefined && {
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        }),
        ...(input.visibleBatchIds !== undefined && {
          visibleBatchIds: input.visibleBatchIds,
        }),
      },
      include: { batch: { select: { id: true, name: true } } },
    });

    cacheService.delByPrefix(InvalidationPatterns.appResources);

    return {
      id: material.id,
      title: material.title,
      description: material.description,
      subject: material.subject,
      chapter: material.chapter,
      materialType: material.materialType,
      materialStatus: material.materialStatus,
      scheduledAt: material.scheduledAt?.toISOString() ?? null,
      files: (material.files as unknown as AppResourceFile[]) || [],
      batchId: material.batchId,
      batchName: material.batch.name,
      visibleBatchIds: material.visibleBatchIds,
      createdAt: material.createdAt.toISOString(),
    };
  }

  /**
   * Soft-delete a study material (teacher must own it).
   */
  async deleteTeacherMaterial(
    materialId: number,
    teacherId: number,
    teacherName: string
  ): Promise<void> {
    const existing = await prisma.studyMaterial.findFirst({
      where: { id: materialId, teacherId, isDeleted: false },
    });

    if (!existing) {
      throw new Error("Material not found or access denied");
    }

    await prisma.studyMaterial.update({
      where: { id: materialId },
      data: { isDeleted: true, deletedBy: teacherName },
    });

    cacheService.delByPrefix(InvalidationPatterns.appResources);
  }

  /**
   * Publish a draft material.
   */
  async publishTeacherMaterial(
    materialId: number,
    teacherId: number
  ): Promise<TeacherMaterialListItem> {
    const existing = await prisma.studyMaterial.findFirst({
      where: { id: materialId, teacherId, isDeleted: false },
    });

    if (!existing) {
      throw new Error("Material not found or access denied");
    }
    if (existing.materialStatus === "PUBLISHED") {
      throw new Error("Material is already published");
    }

    return this.updateTeacherMaterial(materialId, teacherId, {
      materialStatus: "PUBLISHED",
      scheduledAt: null,
    });
  }
}

export const resourcesService = new ResourcesService();
