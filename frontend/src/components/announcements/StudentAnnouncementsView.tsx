"use client"

import { Bell, AlertCircle, Clock, User, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetAppAnnouncementsQuery } from "@/redux/slices/app/appApi"
import type { Announcement, AnnouncementPriority } from "@/redux/slices/announcements/announcementsApi"

const priorityColors: Record<AnnouncementPriority, string> = {
    URGENT: "bg-red-500/10 text-red-500 border-red-500/20",
    HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    NORMAL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    LOW: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const priorityLabels: Record<AnnouncementPriority, string> = {
    URGENT: "Urgent",
    HIGH: "Important",
    NORMAL: "Update",
    LOW: "Info",
}

interface StudentAnnouncementsViewProps {
    limit?: number
    showHeader?: boolean
}

export function StudentAnnouncementsView({ limit = 10, showHeader = true }: StudentAnnouncementsViewProps) {
    const { data: announcements, isLoading, isError } = useGetAppAnnouncementsQuery(limit)

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Recently"
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        })
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {showHeader && (
                    <div className="flex items-center gap-2 mb-6">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                )}
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4 border-border/40">
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-16 rounded-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )
    }

    if (isError) {
        return (
            <Card className="p-8 text-center border-dashed border-border/60">
                <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold text-sm">Unable to Load Announcements</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Please check your connection and try again.
                </p>
            </Card>
        )
    }

    if (!announcements || announcements.length === 0) {
        return (
            <Card className="p-8 text-center border-dashed border-border/60">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="font-semibold text-sm">No Announcements</h3>
                <p className="text-xs text-muted-foreground mt-1">
                    You are all caught up! Check back later for updates.
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {showHeader && (
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        Announcements
                    </h2>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                        {announcements.length} new
                    </Badge>
                </div>
            )}

            <div className="space-y-3">
                {announcements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} formatDate={formatDate} />
                ))}
            </div>
        </div>
    )
}

interface AnnouncementCardProps {
    announcement: Announcement
    formatDate: (date: string | null) => string
}

function AnnouncementCard({ announcement, formatDate }: AnnouncementCardProps) {
    const isUrgent = announcement.priority === "URGENT" || announcement.priority === "HIGH"

    return (
        <Card className={`p-4 border-border/40 transition-all hover:border-border/60 ${
            isUrgent ? 'border-l-2 border-l-red-500/50' : ''
        }`}>
            <div className="flex items-start gap-4">
                {/* Icon/Image */}
                <div className={`shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                    isUrgent ? 'bg-red-500/10' : 'bg-muted/50'
                }`}>
                    {announcement.imageUrl ? (
                        <img
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${announcement.imageUrl}`}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                        />
                    ) : (
                        <Bell className={`h-5 w-5 ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`} />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider border ${priorityColors[announcement.priority]}`}
                        >
                            {priorityLabels[announcement.priority]}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(announcement.date || announcement.createdAt)}
                        </span>
                    </div>

                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                        {announcement.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {announcement.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/60">
                        <User className="h-3 w-3" />
                        <span>By {announcement.createdBy}</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}
