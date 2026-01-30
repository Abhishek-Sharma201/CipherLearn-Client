"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    GraduationCap,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    BarChart3
} from "lucide-react"
import { useGetAppProfileQuery } from "@/redux/slices/app/appApi"
import { useGetStudentAttendanceHistoryQuery } from "@/redux/slices/attendance/attendanceApi"
import { useAppSelector } from "@/redux/hooks"

export function StudentAppProfile() {
    const { user } = useAppSelector((state) => state.auth)

    // Fetch student profile
    const { data: profile, isLoading: profileLoading, isError: profileError } = useGetAppProfileQuery()

    // Fetch attendance history if we have the profile
    const { data: attendanceHistory } = useGetStudentAttendanceHistoryQuery(
        { studentId: profile?.id ?? 0, limit: 30 },
        { skip: !profile?.id }
    )

    // Calculate attendance stats
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (profileLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 py-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (profileError || !profile) {
        return (
            <Card className="text-center py-16 border-dashed border-border/60">
                <div className="flex flex-col items-center">
                    <User className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold">Profile Not Found</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[280px]">
                        Unable to load your profile. Please contact support if this issue persists.
                    </p>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center py-6">
                <Avatar className="h-24 w-24 mb-4 border-4 border-foreground/10">
                    <AvatarFallback className="text-2xl font-bold bg-foreground text-background">
                        {getInitials(profile.fullname)}
                    </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold tracking-tight">{profile.fullname}</h1>
                <p className="text-sm text-muted-foreground font-medium mt-1">{profile.email}</p>
                {profile.batch && (
                    <Badge variant="outline" className="mt-3 font-semibold">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {profile.batch.name}
                    </Badge>
                )}
            </div>

            {/* Attendance Overview */}
            <Card className="border-border/60">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        Attendance Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Attendance Rate</span>
                            <span className={`text-lg font-bold ${
                                attendanceStats.percentage >= 80
                                    ? 'text-emerald-500'
                                    : attendanceStats.percentage >= 60
                                        ? 'text-amber-500'
                                        : 'text-rose-500'
                            }`}>
                                {attendanceStats.percentage.toFixed(1)}%
                            </span>
                        </div>
                        <Progress value={attendanceStats.percentage} className="h-2" />
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            <div className="text-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-emerald-500">{attendanceStats.present}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Present</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                <XCircle className="h-5 w-5 text-rose-500 mx-auto mb-1" />
                                <p className="text-lg font-bold text-rose-500">{attendanceStats.absent}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Absent</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-foreground/5 border border-foreground/10">
                                <TrendingUp className="h-5 w-5 text-foreground/60 mx-auto mb-1" />
                                <p className="text-lg font-bold">{attendanceStats.total}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Days</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-border/60">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                    <div className="py-4 border-b border-border/40 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted/50">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                Full Name
                            </p>
                            <p className="text-sm font-medium truncate">{profile.fullname}</p>
                        </div>
                    </div>

                    <div className="py-4 border-b border-border/40 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted/50">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                Email Address
                            </p>
                            <p className="text-sm font-medium truncate">{profile.email}</p>
                        </div>
                    </div>

                    {profile.dob && (
                        <div className="py-4 border-b border-border/40 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted/50">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Date of Birth
                                </p>
                                <p className="text-sm font-medium">{profile.dob}</p>
                            </div>
                        </div>
                    )}

                    {profile.address && (
                        <div className="py-4 border-b border-border/40 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted/50">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Address
                                </p>
                                <p className="text-sm font-medium">{profile.address}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Batch Information */}
            {profile.batch && (
                <Card className="border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            Batch Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0">
                        <div className="py-4 border-b border-border/40 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted/50">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                    Batch Name
                                </p>
                                <p className="text-sm font-medium">{profile.batch.name}</p>
                            </div>
                        </div>

                        {profile.batch.timings && (
                            <>
                                <div className="py-4 border-b border-border/40 flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-muted/50">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                            Class Time
                                        </p>
                                        <p className="text-sm font-medium">{profile.batch.timings.time || 'Not set'}</p>
                                    </div>
                                </div>

                                <div className="py-4 flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-muted/50">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                            Class Days
                                        </p>
                                        <p className="text-sm font-medium">
                                            {profile.batch.timings.days?.length > 0
                                                ? profile.batch.timings.days.join(', ')
                                                : 'Not set'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
