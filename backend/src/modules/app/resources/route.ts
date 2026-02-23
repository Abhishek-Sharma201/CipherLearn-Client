import { Router } from "express";
import { resourcesController } from "./controller";
import { isStudent, isTeacher } from "../../auth/middleware";
import { appReadRateLimiter, fileUploadRateLimiter } from "../../../middleware/rateLimiter";
import { materialUpload } from "../../../config/multer.config";

const router = Router();

// ==================== TEACHER ROUTES ====================

/**
 * GET /app/resources/teacher
 * Teacher: list their study materials
 *   ?tab=published|drafts|scheduled&subject=&batchId=&page=&limit=
 */
router.get(
  "/teacher",
  isTeacher,
  appReadRateLimiter,
  resourcesController.getTeacherMaterials.bind(resourcesController)
);

/**
 * POST /app/resources/teacher
 * Teacher: upload study material (100MB per file, max 5 files)
 * Body (multipart/form-data): title, batchId, files[], + optional fields
 *
 * Rate limit: 10 uploads per 5 min
 */
router.post(
  "/teacher",
  isTeacher,
  fileUploadRateLimiter,
  materialUpload.array("files", 5),
  resourcesController.createTeacherMaterial.bind(resourcesController)
);

/**
 * PUT /app/resources/teacher/:id/publish
 * Teacher: publish a draft or scheduled material
 * Must come BEFORE /:id to avoid route collision
 */
router.put(
  "/teacher/:id/publish",
  isTeacher,
  resourcesController.publishTeacherMaterial.bind(resourcesController)
);

/**
 * PUT /app/resources/teacher/:id
 * Teacher: update material details
 * Body (JSON): { title?, description?, subject?, chapter?, materialType?,
 *               materialStatus?, scheduledAt?, visibleBatchIds? }
 */
router.put(
  "/teacher/:id",
  isTeacher,
  resourcesController.updateTeacherMaterial.bind(resourcesController)
);

/**
 * DELETE /app/resources/teacher/:id
 * Teacher: soft-delete material
 */
router.delete(
  "/teacher/:id",
  isTeacher,
  resourcesController.deleteTeacherMaterial.bind(resourcesController)
);

// ==================== STUDENT ROUTES ====================

/**
 * GET /app/resources/videos
 * Student: YouTube videos for their batch
 *   ?search=&category=&limit=
 */
router.get(
  "/videos",
  isStudent,
  appReadRateLimiter,
  resourcesController.getVideos.bind(resourcesController)
);

/**
 * GET /app/resources/notes
 * Student: text notes for their batch
 *   ?search=&category=&limit=
 */
router.get(
  "/notes",
  isStudent,
  appReadRateLimiter,
  resourcesController.getNotes.bind(resourcesController)
);

/**
 * GET /app/resources/study-materials
 * Student: study materials (includes visibleBatchIds)
 *   ?search=&category=&limit=
 */
router.get(
  "/study-materials",
  isStudent,
  appReadRateLimiter,
  resourcesController.getStudyMaterials.bind(resourcesController)
);

export default router;
