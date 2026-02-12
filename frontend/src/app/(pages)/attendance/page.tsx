"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceMarker } from "@/components/attendance/AttendanceMarker"
import { AttendanceReport } from "@/components/attendance/AttendanceReport"
import { AttendanceHistory } from "@/components/attendance/AttendanceHistory"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"

// QR attendance temporarily disabled
// import { QRCodeGenerator } from "@/components/attendance/QRCodeGenerator"
// import { QRCodeScanner } from "@/components/attendance/QRCodeScanner"
// import { useGetMyStudentProfileQuery } from "@/redux/slices/students/studentsApi"
// import { Loader2, AlertCircle } from "lucide-react"

export default function AttendancePage() {
    const { user } = useSelector((state: RootState) => state.auth)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER'
    const isStudent = user?.role === 'STUDENT'

    return (
        <div className="space-y-10 py-8 px-6 max-w-[1400px] mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 border-b border-border/40 pb-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">
                        Attendance
                    </h1>
                    <p className="text-muted-vercel mt-2">
                        {isAdmin
                            ? "Mark and monitor student attendance across all batches."
                            : "View your attendance records and history."
                        }
                    </p>
                </div>
            </div>

            <Tabs defaultValue={isAdmin ? "mark" : "history"} className="space-y-8">
                <TabsList className="bg-transparent border-b border-border/40 w-full justify-start rounded-none h-auto p-0 gap-8">
                    {isAdmin && (
                        <TabsTrigger
                            value="mark"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none px-0 py-3 text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Mark Attendance
                        </TabsTrigger>
                    )}
                    <TabsTrigger
                        value="history"
                        className="bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none px-0 py-3 text-xs font-black uppercase tracking-widest transition-all"
                    >
                        History
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger
                            value="report"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none px-0 py-3 text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Reports
                        </TabsTrigger>
                    )}
                </TabsList>

                {isAdmin && (
                    <TabsContent value="mark" className="animate-fade-in focus-visible:outline-none">
                        <div className="card-vercel !px-0 !py-0 border-border/40 overflow-hidden">
                            <div className="px-8 py-6 border-b border-border/40">
                                <h3 className="text-sm font-black uppercase tracking-widest">Mark Attendance</h3>
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                    Select a batch and date to mark attendance for students.
                                </p>
                            </div>
                            <div className="p-8">
                                <AttendanceMarker />
                            </div>
                        </div>
                    </TabsContent>
                )}

                <TabsContent value="history" className="animate-fade-in focus-visible:outline-none">
                    <div className="card-vercel !px-0 !py-0 border-border/40 overflow-hidden">
                        <div className="px-8 py-6 border-b border-border/40">
                            <h3 className="text-sm font-black uppercase tracking-widest">Attendance History</h3>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                {isAdmin
                                    ? "View attendance records for all students and batches."
                                    : "View your attendance records."
                                }
                            </p>
                        </div>
                        <div className="p-8">
                            <AttendanceHistory />
                        </div>
                    </div>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="report" className="animate-fade-in focus-visible:outline-none">
                        <AttendanceReport />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}
