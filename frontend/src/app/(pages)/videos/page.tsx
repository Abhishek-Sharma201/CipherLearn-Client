"use client"

import { PermissionGate } from "@/components/layout/PermissionGate"

import { useState } from "react"
import { VideoGrid } from "@/components/videos/VideoGrid"
import { AddVideoDialog } from "@/components/videos/AddVideoDialog"
import { useGetAllBatchesQuery } from "@/redux/slices/batches/batchesApi"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function VideosPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined)

    const { user } = useSelector((state: RootState) => state.auth)
    const isAdmin = user?.role === "ADMIN" || user?.role === "TEACHER"

    const { data: batchesData } = useGetAllBatchesQuery()
    const batches = batchesData || []

    return (
        <PermissionGate permissionKey="canUploadVideos" featureName="Video Lectures">
        <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Video Lectures</h1>
                    <p className="text-[14.5px] text-muted-foreground mt-1 leading-relaxed">
                        Share recorded lessons and tutorial videos with your students.
                    </p>
                </div>
                {isAdmin && <AddVideoDialog />}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Input
                        type="search"
                        placeholder="Search videos..."
                        className="h-9 pl-9 text-[13.5px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search className="h-3.5 w-3.5" />}
                    />
                </div>
                <Select
                    value={selectedBatchId?.toString() || "all"}
                    onValueChange={(v) => setSelectedBatchId(v === "all" ? undefined : Number(v))}
                >
                    <SelectTrigger className="h-9 w-[180px] text-[13.5px]">
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

            <VideoGrid batchId={selectedBatchId} searchQuery={searchQuery} isAdmin={isAdmin} />
        </div>
        </PermissionGate>
    )
}
