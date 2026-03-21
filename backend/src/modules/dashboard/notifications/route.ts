import { Router } from "express"
import { isAuthenticated } from "../../auth/middleware"
import { notificationController } from "./controller"

const router = Router()

// All notification routes require authentication
router.get("/", isAuthenticated, notificationController.getNotifications)
router.get("/unread-count", isAuthenticated, notificationController.getUnreadCount)
router.patch("/:id/read", isAuthenticated, notificationController.markAsRead)
router.post("/mark-all-read", isAuthenticated, notificationController.markAllAsRead)

export default router
