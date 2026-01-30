"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Users,
    Search,
    ArrowUpDown,
    TrendingUp,
    TrendingDown,
    Minus,
    Eye,
    Trash2,
    Loader2,
    GraduationCap,
    BarChart3
} from "lucide-react"
import { useGetAllBatchesQuery } from "@/redux/slices/batches/batchesApi"
import { useGetStudentsQuery, useDeleteStudentMutation } from "@/redux/slices/students/studentsApi"
import { useGetAttendanceReportQuery } from "@/redux/slices/attendance/attendanceApi"
import { AddStudentDialog } from "./AddStudentDialog"
import { ImportStudentCsvDialog } from "./ImportStudentCsvDialog"
import { toast } from "sonner"
import type { Student, Batch, StudentAttendanceStats } from "@/types"

interface StudentWithPerformance extends Student {
    attendanceStats?: StudentAttendanceStats;
}

export function StudentManagement() {
    const router = useRouter()
    const [selectedBatchId, setSelectedBatchId] = useState<string>("")
    const [sortByPerformance, setSortByPerformance] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // Fetch batches
    const { data: batches, isLoading: batchesLoading } = useGetAllBatchesQuery()

    // Fetch students for selected batch
    const { data: students, isLoading: studentsLoading, isError: studentsError } = useGetStudentsQuery(
        selectedBatchId ? parseInt(selectedBatchId) : undefined
    )

    // Fetch attendance report for the selected batch (last 30 days)
    const thirtyDaysAgo = useMemo(() => {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        return date.toISOString().split('T')[0]
    }, [])

    const today = useMemo(() => new Date().toISOString().split('T')[0], [])

    const { data: attendanceReport } = useGetAttendanceReportQuery(
        {
            batchId: parseInt(selectedBatchId),
            startDate: thirtyDaysAgo,
            endDate: today
        },
        { skip: !selectedBatchId }
    )

    const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation()

    // Combine students with attendance stats
    const studentsWithPerformance: StudentWithPerformance[] = useMemo(() => {
        if (!students) return []

        const statsMap = new Map<number, StudentAttendanceStats>()
        if (attendanceReport?.studentStats) {
            attendanceReport.studentStats.forEach(stat => {
                statsMap.set(stat.studentId, stat)
            })
        }

        return students.map(student => ({
            ...student,
            attendanceStats: statsMap.get(student.id)
        }))
    }, [students, attendanceReport])

    // Filter and sort students
    const filteredAndSortedStudents = useMemo(() => {
        let result = [...studentsWithPerformance]

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(student =>
                student.fullname.toLowerCase().includes(query) ||
                student.email.toLowerCase().includes(query)
            )
        }

        // Sort by performance if enabled
        if (sortByPerformance) {
            result.sort((a, b) => {
                const aPercentage = a.attendanceStats?.percentage ?? 0
                const bPercentage = b.attendanceStats?.percentage ?? 0
                return bPercentage - aPercentage // Descending order
            })
        }

        return result
    }, [studentsWithPerformance, searchQuery, sortByPerformance])

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Are you sure you want to delete this student?")) return
        try {
            await deleteStudent(id).unwrap()
            toast.success("Student deleted successfully")
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete student")
        }
    }

    const handleRowClick = (studentId: number) => {
        router.push(`/students/${studentId}`)
    }

    const getPerformanceBadge = (percentage: number | undefined) => {
        if (percentage === undefined) {
            return (
                <Badge variant="outline" className="text-[9px] px-2 py-0 h-5 font-semibold tracking-wider border-0 bg-muted/50 text-muted-foreground">
                    <Minus className="h-3 w-3 mr-1" />
                    N/A
                </Badge>
            )
        }

        if (percentage >= 80) {
            return (
                <Badge variant="outline" className="text-[9px] px-2 py-0 h-5 font-semibold tracking-wider border-0 bg-emerald-500/10 text-emerald-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {percentage.toFixed(1)}%
                </Badge>
            )
        }

        if (percentage >= 60) {
            return (
                <Badge variant="outline" className="text-[9px] px-2 py-0 h-5 font-semibold tracking-wider border-0 bg-amber-500/10 text-amber-500">
                    <Minus className="h-3 w-3 mr-1" />
                    {percentage.toFixed(1)}%
                </Badge>
            )
        }

        return (
            <Badge variant="outline" className="text-[9px] px-2 py-0 h-5 font-semibold tracking-wider border-0 bg-rose-500/10 text-rose-500">
                <TrendingDown className="h-3 w-3 mr-1" />
                {percentage.toFixed(1)}%
            </Badge>
        )
    }

    const selectedBatch = batches?.find(b => b.id === parseInt(selectedBatchId))

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Batch Selector */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            Select Batch
                        </label>
                        <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                            <SelectTrigger className="w-full sm:w-[240px] h-10 text-sm font-semibold">
                                <SelectValue placeholder="Choose a batch..." />
                            </SelectTrigger>
                            <SelectContent>
                                {batchesLoading ? (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        Loading batches...
                                    </div>
                                ) : batches && batches.length > 0 ? (
                                    batches.map((batch: Batch) => (
                                        <SelectItem key={batch.id} value={batch.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                <span>{batch.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        No batches available
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Performance Sort Toggle */}
                    {selectedBatchId && (
                        <div className="flex items-center gap-3 sm:ml-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                    Rank by Performance
                                </label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={sortByPerformance}
                                        onCheckedChange={setSortByPerformance}
                                    />
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {sortByPerformance ? "Enabled" : "Disabled"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    <ImportStudentCsvDialog />
                    <AddStudentDialog />
                </div>
            </div>

            {/* Batch Stats */}
            {selectedBatch && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="p-4 border-border/60">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-foreground/5">
                                <Users className="h-4 w-4 text-foreground/60" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Total Students
                                </p>
                                <p className="text-xl font-bold tabular-nums">
                                    {filteredAndSortedStudents.length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 border-border/60">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    High Performers
                                </p>
                                <p className="text-xl font-bold tabular-nums text-emerald-500">
                                    {studentsWithPerformance.filter(s => (s.attendanceStats?.percentage ?? 0) >= 80).length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 border-border/60">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Minus className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Average
                                </p>
                                <p className="text-xl font-bold tabular-nums text-amber-500">
                                    {studentsWithPerformance.filter(s => {
                                        const p = s.attendanceStats?.percentage ?? 0
                                        return p >= 60 && p < 80
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 border-border/60">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-rose-500/10">
                                <TrendingDown className="h-4 w-4 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Needs Attention
                                </p>
                                <p className="text-xl font-bold tabular-nums text-rose-500">
                                    {studentsWithPerformance.filter(s => (s.attendanceStats?.percentage ?? 0) < 60 && s.attendanceStats).length}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Search */}
            {selectedBatchId && (
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                        <input
                            type="search"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 h-10 bg-muted/20 border border-border/40 rounded-md text-[13px] placeholder:text-muted-foreground/50 focus:bg-background focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Students Table */}
            {!selectedBatchId ? (
                <Card className="flex flex-col items-center justify-center py-24 border-dashed border-border/60 bg-muted/5">
                    <div className="bg-foreground/5 p-4 rounded-full mb-4 border border-border/20">
                        <GraduationCap className="h-8 w-8 text-foreground/40" />
                    </div>
                    <h3 className="text-sm font-semibold tracking-tight uppercase opacity-80 mb-2">Select a Batch</h3>
                    <p className="text-[11px] text-muted-foreground max-w-[300px] text-center font-medium leading-relaxed">
                        Choose a batch from the dropdown above to view and manage students.
                    </p>
                </Card>
            ) : studentsLoading ? (
                <Card className="!p-0 overflow-hidden border-border/60">
                    <div className="w-full">
                        <div className="border-b border-border bg-muted/5 px-6 py-3">
                            <div className="grid grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-3 w-20 bg-muted/40" />
                                ))}
                            </div>
                        </div>
                        {[1, 2, 3, 4, 5].map((row) => (
                            <div key={row} className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <Skeleton className="h-8 w-8 rounded-full bg-muted/30" />
                                    <div className="space-y-1.5 flex-1">
                                        <Skeleton className="h-4 w-32 bg-muted/20" />
                                        <Skeleton className="h-3 w-16 bg-muted/10" />
                                    </div>
                                </div>
                                <Skeleton className="h-3 w-32 bg-muted/20" />
                                <Skeleton className="h-5 w-16 bg-muted/30 rounded-md" />
                                <Skeleton className="h-8 w-8 bg-muted/40 rounded-md" />
                            </div>
                        ))}
                    </div>
                </Card>
            ) : studentsError ? (
                <Card className="text-center py-20 bg-destructive/5 border-dashed border-destructive/30 flex flex-col items-center">
                    <h3 className="text-sm font-semibold tracking-tight text-destructive uppercase">Failed to Load Students</h3>
                    <p className="text-[11px] text-muted-foreground mt-2 max-w-[220px] mx-auto font-medium leading-relaxed">
                        Unable to fetch student data. Please try again.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-8 h-8 px-4 text-[10px] font-semibold uppercase tracking-widest border-destructive/20 hover:bg-destructive hover:text-white transition-all"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </Card>
            ) : filteredAndSortedStudents.length === 0 ? (
                <Card className="text-center py-24 border-dashed border-border/60 bg-muted/5 flex flex-col items-center">
                    <h3 className="text-sm font-semibold tracking-tight uppercase opacity-80">No Students Found</h3>
                    <p className="text-[11px] text-muted-foreground mt-2 max-w-[260px] mx-auto font-medium leading-relaxed">
                        {searchQuery ? "No students match your search criteria." : "This batch has no students enrolled yet."}
                    </p>
                    {!searchQuery && (
                        <div className="mt-10 flex gap-4 justify-center items-center">
                            <AddStudentDialog />
                            <div className="h-6 w-px bg-border/60" />
                            <ImportStudentCsvDialog />
                        </div>
                    )}
                </Card>
            ) : (
                <Card className="!p-0 overflow-hidden border-border/60">
                    <Table>
                        <TableHeader className="bg-muted/5">
                            <TableRow className="hover:bg-transparent border-border/60">
                                {sortByPerformance && (
                                    <TableHead className="w-[60px] text-[10px] font-semibold uppercase tracking-widest py-4 pl-6 text-muted-foreground">
                                        Rank
                                    </TableHead>
                                )}
                                <TableHead className="w-[280px] text-[10px] font-semibold uppercase tracking-widest py-4 pl-6 text-muted-foreground">
                                    Student
                                </TableHead>
                                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 text-muted-foreground">
                                    Email
                                </TableHead>
                                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <BarChart3 className="h-3 w-3" />
                                        Attendance
                                    </div>
                                </TableHead>
                                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 text-muted-foreground">
                                    Enrolled
                                </TableHead>
                                <TableHead className="text-right text-[10px] font-semibold uppercase tracking-widest py-4 pr-6 text-muted-foreground">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedStudents.map((student, index) => (
                                <TableRow
                                    key={student.id}
                                    className="group border-border/40 hover:bg-muted/10 transition-colors cursor-pointer"
                                    onClick={() => handleRowClick(student.id)}
                                >
                                    {sortByPerformance && (
                                        <TableCell className="py-4 pl-6">
                                            <div className={`
                                                h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold
                                                ${index === 0 ? 'bg-amber-500/20 text-amber-500' : ''}
                                                ${index === 1 ? 'bg-slate-400/20 text-slate-400' : ''}
                                                ${index === 2 ? 'bg-orange-600/20 text-orange-600' : ''}
                                                ${index > 2 ? 'bg-muted/50 text-muted-foreground' : ''}
                                            `}>
                                                {index + 1}
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-[10px] border border-foreground/10 transition-transform duration-300 group-hover:scale-105">
                                                {student.fullname.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm tracking-tight leading-none text-foreground">
                                                    {student.fullname}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest mt-1 opacity-40">
                                                    ID: {student.id}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-[11px] font-medium tracking-tight text-foreground/80">
                                            {student.email}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {getPerformanceBadge(student.attendanceStats?.percentage)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-medium text-xs lowercase tracking-tighter tabular-nums">
                                        {new Date(student.createdAt).toLocaleDateString("en-US", {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-md hover:bg-muted/50 hover:text-foreground"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRowClick(student.id)
                                                }}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-md hover:bg-rose-500/5 hover:text-rose-500"
                                                onClick={(e) => handleDelete(student.id, e)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    )
}
