"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    MapPin,
    GraduationCap,
    Clock,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    XCircle,
    CreditCard,
    AlertCircle,
    BarChart3,
    Edit,
    Trash2,
    Loader2
} from "lucide-react"
import { useGetStudentByIdQuery, useDeleteStudentMutation } from "@/redux/slices/students/studentsApi"
import { useGetStudentAttendanceHistoryQuery, useGetAttendanceReportQuery } from "@/redux/slices/attendance/attendanceApi"
import { toast } from "sonner"
import type { AttendanceRecord } from "@/types"

interface StudentProfileDetailProps {
    studentId: number
}

export function StudentProfileDetail({ studentId }: StudentProfileDetailProps) {
    const router = useRouter()

    // Fetch student data
    const { data: student, isLoading: studentLoading, isError: studentError } = useGetStudentByIdQuery(studentId)

    // Fetch attendance history
    const { data: attendanceHistory } = useGetStudentAttendanceHistoryQuery({
        studentId,
        limit: 30
    })

    // Fetch attendance report for the student's batch (last 30 days)
    const thirtyDaysAgo = useMemo(() => {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        return date.toISOString().split('T')[0]
    }, [])

    const today = useMemo(() => new Date().toISOString().split('T')[0], [])

    const { data: batchReport } = useGetAttendanceReportQuery(
        {
            batchId: student?.batchId ?? 0,
            startDate: thirtyDaysAgo,
            endDate: today
        },
        { skip: !student?.batchId }
    )

    // Calculate student's attendance stats from history
    const attendanceStats = useMemo(() => {
        if (!attendanceHistory || attendanceHistory.length === 0) {
            return { present: 0, absent: 0, total: 0, percentage: 0 }
        }

        const present = attendanceHistory.filter(a => a.status === 'PRESENT').length
        const absent = attendanceHistory.filter(a => a.status === 'ABSENT').length
        const total = present + absent
        const percentage = total > 0 ? (present / total) * 100 : 0

        return { present, absent, total, percentage }
    }, [attendanceHistory])

    // Get student rank in batch
    const studentRank = useMemo(() => {
        if (!batchReport?.studentStats || !student) return null

        const sortedStats = [...batchReport.studentStats].sort(
            (a, b) => b.percentage - a.percentage
        )
        const rank = sortedStats.findIndex(s => s.studentId === studentId) + 1
        return {
            rank,
            total: sortedStats.length
        }
    }, [batchReport, student, studentId])

    const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return
        try {
            await deleteStudent(studentId).unwrap()
            toast.success("Student deleted successfully")
            router.push("/students")
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete student")
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (studentLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="p-6">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-16" />
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (studentError || !student) {
        return (
            <Card className="text-center py-20 bg-destructive/5 border-dashed border-destructive/30 flex flex-col items-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold text-destructive">Student Not Found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    The student profile could not be loaded.
                </p>
                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => router.push("/students")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Students
                </Button>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={() => router.push("/students")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-xl border-2 border-foreground/10">
                            {student.fullname.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{student.fullname}</h1>
                            <p className="text-sm text-muted-foreground font-medium">
                                Student ID: {student.id}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                    <Button variant="outline" size="sm" className="h-9">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/5"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 border-border/60">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60 mb-1">
                                Attendance Rate
                            </p>
                            <p className="text-3xl font-bold tabular-nums">
                                {attendanceStats.percentage.toFixed(1)}%
                            </p>
                        </div>
                        <div className={`p-3 rounded-full ${
                            attendanceStats.percentage >= 80
                                ? 'bg-emerald-500/10'
                                : attendanceStats.percentage >= 60
                                    ? 'bg-amber-500/10'
                                    : 'bg-rose-500/10'
                        }`}>
                            {attendanceStats.percentage >= 80 ? (
                                <TrendingUp className="h-6 w-6 text-emerald-500" />
                            ) : attendanceStats.percentage >= 60 ? (
                                <BarChart3 className="h-6 w-6 text-amber-500" />
                            ) : (
                                <TrendingDown className="h-6 w-6 text-rose-500" />
                            )}
                        </div>
                    </div>
                    <Progress
                        value={attendanceStats.percentage}
                        className="mt-3 h-2"
                    />
                </Card>

                <Card className="p-6 border-border/60">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60 mb-1">
                                Days Present
                            </p>
                            <p className="text-3xl font-bold tabular-nums text-emerald-500">
                                {attendanceStats.present}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-emerald-500/10">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Out of {attendanceStats.total} total days
                    </p>
                </Card>

                <Card className="p-6 border-border/60">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60 mb-1">
                                Days Absent
                            </p>
                            <p className="text-3xl font-bold tabular-nums text-rose-500">
                                {attendanceStats.absent}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-rose-500/10">
                            <XCircle className="h-6 w-6 text-rose-500" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        In the last 30 days
                    </p>
                </Card>

                <Card className="p-6 border-border/60">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60 mb-1">
                                Batch Rank
                            </p>
                            <p className="text-3xl font-bold tabular-nums">
                                {studentRank ? `#${studentRank.rank}` : 'N/A'}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-foreground/5">
                            <GraduationCap className="h-6 w-6 text-foreground/60" />
                        </div>
                    </div>
                    {studentRank && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Out of {studentRank.total} students
                        </p>
                    )}
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <Card className="border-border/60">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Email
                                </p>
                                <p className="text-sm font-medium">{student.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Date of Birth
                                </p>
                                <p className="text-sm font-medium">{student.dob || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Address
                                </p>
                                <p className="text-sm font-medium">{student.address || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Enrolled On
                                </p>
                                <p className="text-sm font-medium">{formatDate(student.createdAt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Batch Information */}
                <Card className="border-border/60">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            Batch Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                Current Batch
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-semibold">
                                    Batch #{student.batchId}
                                </Badge>
                            </div>
                        </div>
                        {batchReport && (
                            <>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                        Batch Name
                                    </p>
                                    <p className="text-sm font-medium mt-1">{batchReport.batchName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                        Batch Attendance
                                    </p>
                                    <p className="text-sm font-medium mt-1">
                                        {batchReport.overallAttendancePercentage.toFixed(1)}% average
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                        Total Students
                                    </p>
                                    <p className="text-sm font-medium mt-1">{batchReport.totalStudents} students</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-border/60">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            Performance Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Performance Rating</span>
                            <Badge
                                variant="outline"
                                className={`
                                    ${attendanceStats.percentage >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                                    ${attendanceStats.percentage >= 60 && attendanceStats.percentage < 80 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
                                    ${attendanceStats.percentage < 60 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : ''}
                                `}
                            >
                                {attendanceStats.percentage >= 80
                                    ? 'Excellent'
                                    : attendanceStats.percentage >= 60
                                        ? 'Average'
                                        : 'Needs Improvement'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Compared to Batch</span>
                            {batchReport && (
                                <span className={`text-sm font-semibold ${
                                    attendanceStats.percentage >= batchReport.overallAttendancePercentage
                                        ? 'text-emerald-500'
                                        : 'text-rose-500'
                                }`}>
                                    {attendanceStats.percentage >= batchReport.overallAttendancePercentage
                                        ? `+${(attendanceStats.percentage - batchReport.overallAttendancePercentage).toFixed(1)}%`
                                        : `${(attendanceStats.percentage - batchReport.overallAttendancePercentage).toFixed(1)}%`}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Streak Status</span>
                            <span className="text-sm font-medium">
                                {attendanceHistory && attendanceHistory.length > 0
                                    ? attendanceHistory[0].status === 'PRESENT'
                                        ? 'On Track'
                                        : 'Last Absent'
                                    : 'No Data'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Attendance */}
            <Card className="border-border/60">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Recent Attendance History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {!attendanceHistory || attendanceHistory.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No attendance records found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/5">
                                <TableRow className="hover:bg-transparent border-border/60">
                                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 pl-6 text-muted-foreground">
                                        Date
                                    </TableHead>
                                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 text-muted-foreground">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 text-muted-foreground">
                                        Method
                                    </TableHead>
                                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 text-muted-foreground">
                                        Time
                                    </TableHead>
                                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-3 pr-6 text-muted-foreground">
                                        Marked By
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendanceHistory.slice(0, 10).map((record: AttendanceRecord) => (
                                    <TableRow key={record.id} className="border-border/40 hover:bg-muted/5">
                                        <TableCell className="py-3 pl-6 font-medium text-sm">
                                            {formatDate(record.date)}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge
                                                variant="outline"
                                                className={`text-[9px] px-2 py-0 h-5 font-semibold tracking-wider border-0 ${
                                                    record.status === 'PRESENT'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-rose-500/10 text-rose-500'
                                                }`}
                                            >
                                                {record.status === 'PRESENT' ? (
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                )}
                                                {record.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge variant="outline" className="text-[9px] px-2 py-0 h-5 font-medium tracking-wider">
                                                {record.method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3 text-sm text-muted-foreground">
                                            {record.time || formatTime(record.createdAt)}
                                        </TableCell>
                                        <TableCell className="py-3 pr-6 text-sm text-muted-foreground">
                                            {record.markedBy || 'System'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
