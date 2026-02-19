"use client"

import { useState } from "react"
import { NotesList } from "@/components/notes/NotesList"
import { AddNoteDialog } from "@/components/notes/AddNoteDialog"
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
import { Card } from "@/components/ui/card"

export default function NotesPage() {
    const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined)

    const { user } = useSelector((state: RootState) => state.auth)
    const isAdmin = user?.role === "ADMIN" || user?.role === "TEACHER"

    const { data: batchesData } = useGetAllBatchesQuery()
    const batches = batchesData || []

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Class Notes</h1>
                    <p className="text-[14.5px] text-muted-foreground mt-1 leading-relaxed">
                        Share handouts, PDFs, and notes with your students.
                    </p>
                </div>
                {isAdmin && <AddNoteDialog />}
            </div>

            <div className="flex items-center gap-3">
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

            <Card className="!p-0 overflow-hidden">
                <NotesList batchId={selectedBatchId} isAdmin={isAdmin} />
            </Card>
        </div>
    )
}
