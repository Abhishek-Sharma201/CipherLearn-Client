"use client"

import { use } from "react"
import { StudentProfileDetail } from "@/components/students/StudentProfileDetail"

interface StudentProfilePageProps {
    params: Promise<{ id: string }>
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
    const resolvedParams = use(params)
    const studentId = parseInt(resolvedParams.id, 10)

    if (isNaN(studentId)) {
        return (
            <div className="py-10 px-8 max-w-[1400px] mx-auto">
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold text-destructive">Invalid Student ID</h1>
                    <p className="text-muted-foreground mt-2">The student ID provided is not valid.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="py-10 px-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            <StudentProfileDetail studentId={studentId} />
        </div>
    )
}
