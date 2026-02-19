"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { NotesList } from "@/components/notes/NotesList"
import { VideoGrid } from "@/components/videos/VideoGrid"
import { StudyMaterialsList } from "@/components/study-materials/StudyMaterialsList"
import { AddNoteDialog } from "@/components/notes/AddNoteDialog"
import { AddVideoDialog } from "@/components/videos/AddVideoDialog"
import { AddStudyMaterialDialog } from "@/components/study-materials/AddStudyMaterialDialog"
import { useGetAllBatchesQuery } from "@/redux/slices/batches/batchesApi"
import {
    FileText,
    Video,
    BookOpen,
    FolderOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"

type ResourceTab = "notes" | "videos" | "materials"

const TABS: { id: ResourceTab; label: string; icon: React.ElementType; description: string }[] = [
    {
        id: "notes",
        label: "Notes",
        icon: FileText,
        description: "Handouts, PDFs and class notes"
    },
    {
        id: "videos",
        label: "Videos",
        icon: Video,
        description: "Recorded lectures and tutorials"
    },
    {
        id: "materials",
        label: "Study Materials",
        icon: BookOpen,
        description: "Textbooks, worksheets and extras"
    },
]

export default function ResourcesPage() {
    const [activeTab, setActiveTab] = useState<ResourceTab>("notes")
    const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined)

    const { user } = useSelector((state: RootState) => state.auth)
    const isAdmin = user?.role === "ADMIN" || user?.role === "TEACHER"

    const { data: batchesData } = useGetAllBatchesQuery()
    const batches = batchesData || []

    const currentTab = TABS.find((t) => t.id === activeTab)!

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            Teaching Resources
                        </h1>
                    </div>
                    <p className="text-[14.5px] text-muted-foreground leading-relaxed">
                        All your study materials, lecture notes, and videos — in one place.
                    </p>
                </div>

                {/* Upload button for the active tab */}
                <div className="shrink-0">
                    {isAdmin && activeTab === "notes" && <AddNoteDialog />}
                    {isAdmin && activeTab === "videos" && <AddVideoDialog />}
                    {isAdmin && activeTab === "materials" && <AddStudyMaterialDialog />}
                </div>
            </div>

            {/* Tab navigation + Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-4 py-2 text-[13.5px] font-semibold transition-all",
                                    activeTab === tab.id
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Batch filter */}
                <Select
                    value={selectedBatchId?.toString() || "all"}
                    onValueChange={(v) => setSelectedBatchId(v === "all" ? undefined : Number(v))}
                >
                    <SelectTrigger className="w-[180px] h-9 text-[13.5px]">
                        <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {batches.map((batch) => (
                            <SelectItem key={batch.id} value={String(batch.id)}>
                                {batch.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Active tab info strip */}
            <div className="flex items-center gap-2.5 text-[13.5px] text-muted-foreground">
                {(() => {
                    const Icon = currentTab.icon
                    return <Icon className="h-4 w-4 text-primary" />
                })()}
                <span>{currentTab.description}</span>
            </div>

            {/* Content */}
            <Card className="!p-0 overflow-hidden">
                {activeTab === "notes" && (
                    <NotesList batchId={selectedBatchId} isAdmin={isAdmin} />
                )}
                {activeTab === "videos" && (
                    <div className="p-5">
                        <VideoGrid
                            batchId={selectedBatchId}
                            isAdmin={isAdmin}
                        />
                    </div>
                )}
                {activeTab === "materials" && (
                    <StudyMaterialsList
                        batchId={selectedBatchId}
                        isAdmin={isAdmin}
                    />
                )}
            </Card>
        </div>
    )
}
