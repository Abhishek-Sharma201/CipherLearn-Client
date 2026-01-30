"use client"

import { StudentManagement } from "@/components/students/StudentManagement"

export default function StudentsPage() {
    return (
        <div className="space-y-10 py-8 px-6 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            <div className="border-b border-border/40 pb-10">
                <h1 className="text-3xl font-bold tracking-tighter text-foreground">
                    Student Management
                </h1>
                <p className="text-muted-foreground mt-1.5 text-sm font-medium">
                    Manage student enrollments, track attendance, and monitor performance across batches.
                </p>
            </div>

            <StudentManagement />
        </div>
    )
}
