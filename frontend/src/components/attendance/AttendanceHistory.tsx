"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Check, X, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useGetBatchAttendanceByDateQuery } from "@/redux/slices/attendance/attendanceApi"
import { useGetAllBatchesQuery } from "@/redux/slices/batches/batchesApi"
import { Batch } from "@/types"

export function AttendanceHistory() {
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    )

    const { data: batchesData } = useGetAllBatchesQuery()
    const batches = batchesData || []

    const { data: batchAttendance, isLoading } = useGetBatchAttendanceByDateQuery(
        { batchId: selectedBatchId!, date: selectedDate },
        { skip: !selectedBatchId }
    )

    const presentCount = batchAttendance?.filter((r: any) => r.status === 'PRESENT').length ?? 0
    const absentCount = batchAttendance?.filter((r: any) => r.status === 'ABSENT').length ?? 0
    const lateCount = batchAttendance?.filter((r: any) => r.status === 'LATE').length ?? 0

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* ─── Filters ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Batch
                    </label>
                    <Select
                        value={String(selectedBatchId || "")}
                        onValueChange={(v) => setSelectedBatchId(Number(v) || null)}
                    >
                        <SelectTrigger className="h-10 text-[13px] font-medium rounded-xl border-border/60">
                            <SelectValue placeholder="Select a batch…" />
                        </SelectTrigger>
                        <SelectContent>
                            {batches.map((batch: Batch) => (
                                <SelectItem key={batch.id} value={String(batch.id)}>
                                    <span className="font-semibold">{batch.name}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Date
                    </label>
                    <Input
                        type="date"
                        className="h-10 text-[13px] font-medium rounded-xl border-border/60"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </div>

            {!selectedBatchId ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="h-7 w-7 text-foreground/15 mb-3" />
                    <h3 className="text-sm font-semibold mb-1">Select a batch</h3>
                    <p className="text-[12.5px] text-muted-foreground max-w-[260px] leading-relaxed">
                        Choose a batch and date to view attendance records.
                    </p>
                </div>
            ) : isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-14 rounded-xl bg-muted/15" />
                    ))}
                </div>
            ) : batchAttendance && batchAttendance.length > 0 ? (
                <>
                    {/* ─── Summary Strip ─── */}
                    <div className="flex items-center gap-4 text-[12px] font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            {presentCount} Present
                        </span>
                        <span className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            {absentCount} Absent
                        </span>
                        {lateCount > 0 && (
                            <span className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                {lateCount} Late
                            </span>
                        )}
                        <span className="ml-auto">
                            {batchAttendance.length} students total
                        </span>
                    </div>

                    {/* ─── Records ─── */}
                    <div className="space-y-1.5">
                        {batchAttendance.map((record: any) => {
                            const isPresent = record.status === 'PRESENT'
                            const isLate = record.status === 'LATE'
                            const isAbsent = record.status === 'ABSENT'

                            return (
                                <div
                                    key={record.id}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${
                                        isPresent ? "bg-emerald-500/5 border-emerald-500/15" :
                                        isLate ? "bg-amber-500/5 border-amber-500/15" :
                                        "bg-red-500/5 border-red-500/12"
                                    }`}
                                >
                                    {/* Status Icon */}
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isPresent ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                                        isLate ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                                        "bg-red-500/15 text-red-500"
                                    }`}>
                                        {isPresent ? <Check className="h-4 w-4" strokeWidth={3} /> :
                                         isLate ? <Clock className="h-4 w-4" strokeWidth={2.5} /> :
                                         <X className="h-4 w-4" strokeWidth={2.5} />}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13.5px] font-semibold truncate">
                                            {record.student?.fullname || 'Unknown'}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                            {record.student?.email || '-'}
                                        </p>
                                    </div>

                                    {/* Status + Method */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] font-bold uppercase tracking-wider border-0 ${
                                                isPresent ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15" :
                                                isLate ? "text-amber-600 dark:text-amber-400 bg-amber-500/15" :
                                                "text-red-500 bg-red-500/10"
                                            }`}
                                        >
                                            {record.status}
                                        </Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Users className="h-7 w-7 text-foreground/15 mb-3" />
                    <h3 className="text-sm font-semibold mb-1">No records found</h3>
                    <p className="text-[12.5px] text-muted-foreground max-w-[280px] leading-relaxed">
                        No attendance was taken for this batch on {new Date(selectedDate + 'T00:00:00').toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.
                    </p>
                </div>
            )}
        </div>
    )
}