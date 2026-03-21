import { prisma } from "../../../config/db.config"
import type { NotificationType } from "../../../../prisma/generated/prisma/client"

export const notificationService = {
    async getByUserId(userId: number, limit = 30, unreadOnly = false) {
        return prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly ? { isRead: false } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        })
    },

    async getUnreadCount(userId: number) {
        return prisma.notification.count({
            where: { userId, isRead: false },
        })
    },

    async markAsRead(id: number, userId: number) {
        return prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        })
    },

    async markAllAsRead(userId: number) {
        return prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        })
    },

    async create(data: {
        userId: number
        title: string
        message: string
        type?: NotificationType
        link?: string
    }) {
        return prisma.notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: data.type || "INFO",
                link: data.link,
            },
        })
    },

    async createForMultipleUsers(data: {
        userIds: number[]
        title: string
        message: string
        type?: NotificationType
        link?: string
    }) {
        return prisma.notification.createMany({
            data: data.userIds.map((userId) => ({
                userId,
                title: data.title,
                message: data.message,
                type: data.type || "INFO",
                link: data.link,
            })),
        })
    },

    async deleteOld(days = 30) {
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        return prisma.notification.deleteMany({
            where: { createdAt: { lt: cutoff } },
        })
    },
}
