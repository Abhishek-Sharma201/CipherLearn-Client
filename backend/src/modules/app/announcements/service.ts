import { prisma } from "../../../config/db.config";
import { cacheService } from "../../../cache/index";
import { AppKeys } from "../../../cache/keys";
import { APP_ANNOUNCEMENTS } from "../../../cache/ttl";
import type { AppAnnouncement } from "./types";

class AnnouncementsService {
  /**
   * Get active announcements
   */
  async getAnnouncements(limit: number = 5): Promise<AppAnnouncement[]> {
    return cacheService.getOrSet(
      AppKeys.announcements(limit),
      async () => {
        const announcements = await prisma.announcement.findMany({
          where: { isActive: true },
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
          take: limit,
        });

        return announcements.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          imageUrl: a.imageUrl,
          date: a.date?.toISOString() || null,
          priority: a.priority,
          createdAt: a.createdAt.toISOString(),
        }));
      },
      APP_ANNOUNCEMENTS
    );
  }
}

export const announcementsService = new AnnouncementsService();
