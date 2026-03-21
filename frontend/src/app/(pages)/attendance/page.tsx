"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceMarker } from "@/components/attendance/AttendanceMarker"
import { AttendanceReport } from "@/components/attendance/AttendanceReport"
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { ClipboardCheck, History, BarChart3 } from "lucide-react"

export default function AttendancePage() {
    const { user } = useSelector((state: RootState) => state.auth)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER'

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            {/* ─── Slim Header ─── */}
            <div>
                <h1 className="text-2xl font-black tracking-tight">Attendance</h1>
                <p className="text-[13px] text-muted-foreground mt-1 font-medium">
                    {isAdmin
                        ? "Take attendance, review history, and track reports."
                        : "View your attendance records."
                    }
                </p>
            </div>

            {/* ─── Tabs ─── */}
            <Tabs defaultValue={isAdmin ? "mark" : "history"} className="space-y-5">
                <TabsList className="bg-muted/30 p-1 rounded-xl h-auto gap-1 w-auto inline-flex">
                    {isAdmin && (
                        <TabsTrigger
                            value="mark"
                            className="rounded-lg px-4 py-2 text-[12px] font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5 transition-all"
                        >
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            Take Attendance
                        </TabsTrigger>
                    )}
                    <TabsTrigger
                        value="history"
                        className="rounded-lg px-4 py-2 text-[12px] font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5 transition-all"
                    >
                        <History className="h-3.5 w-3.5" />
                        History
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger
                            value="report"
                            className="rounded-lg px-4 py-2 text-[12px] font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5 transition-all"
                        >
                            <BarChart3 className="h-3.5 w-3.5" />
                            Reports
                        </TabsTrigger>
                    )}
                </TabsList>

                {isAdmin && (
                    <TabsContent value="mark" className="focus-visible:outline-none">
                        <AttendanceMarker />
                    </TabsContent>
                )}

                <TabsContent value="history" className="focus-visible:outline-none">
                    <AttendanceHistory />
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="report" className="focus-visible:outline-none">
                        <AttendanceReport />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}
