"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { LectureTable } from "@/components/lectures/LectureTable"
import { LectureCalendar } from "@/components/lectures/LectureCalendar"
import { AddLectureDialog } from "@/components/lectures/AddLectureDialog"
import { CalendarDays, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { PermissionGate } from "@/components/layout/PermissionGate"

type ViewMode = "calendar" | "list"

export default function LecturesPage() {
    const [view, setView] = useState<ViewMode>("calendar")

    if (view === "calendar") {
        return (
            <PermissionGate permissionKey="canManageLectures" featureName="Lectures">
            {/* Full-height layout: fits exactly in the viewport with no scroll
                100vh - navbar(64px) - padding top+bottom (p-5=40px or md:p-7=56px) */}
            <div
                className="flex flex-col animate-fade-in h-[calc(100vh-104px)] md:h-[calc(100vh-120px)]"
            >
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            Teaching Schedule
                        </h1>
                        <p className="text-[14px] text-muted-foreground mt-0.5 leading-relaxed">
                            Plan your week — click any date to schedule a class.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* View toggle */}
                        <div className="inline-flex items-center rounded-lg border border-border bg-secondary/60 p-0.5">
                            <button
                                onClick={() => setView("calendar")}
                                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all bg-background text-foreground shadow-sm"
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                Calendar
                            </button>
                            <button
                                onClick={() => setView("list")}
                                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all text-muted-foreground hover:text-foreground"
                            >
                                <List className="h-3.5 w-3.5" />
                                List
                            </button>
                        </div>

                        <AddLectureDialog />
                    </div>
                </div>

                {/* Calendar — fills remaining height */}
                <div className="flex-1 min-h-0">
                    <LectureCalendar />
                </div>
            </div>
            </PermissionGate>
        )
    }

    return (
        <PermissionGate permissionKey="canManageLectures" featureName="Lectures">
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Teaching Schedule
                    </h1>
                    <p className="text-[14.5px] text-muted-foreground mt-1 leading-relaxed">
                        Plan your week — schedule classes, assign rooms, and keep students informed.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* View toggle */}
                    <div className="inline-flex items-center rounded-lg border border-border bg-secondary/60 p-0.5">
                        <button
                            onClick={() => setView("calendar")}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all",
                                "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <CalendarDays className="h-3.5 w-3.5" />
                            Calendar
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-all bg-background text-foreground shadow-sm"
                        >
                            <List className="h-3.5 w-3.5" />
                            List
                        </button>
                    </div>

                    <AddLectureDialog />
                </div>
            </div>

            {/* List View */}
            <Card className="!p-0 overflow-hidden">
                <LectureTable />
            </Card>
        </div>
        </PermissionGate>
    )
}
