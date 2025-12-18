"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Trash2, Loader2 } from "lucide-react"
import { useGetStudentsQuery, useDeleteStudentMutation } from "@/redux/slices/students/studentsApi"
import { Student } from "@/types"

interface StudentTableProps {
    batchId?: number;
}

export function StudentTable({ batchId = 1 }: StudentTableProps) {
    const { data: students, isLoading, isError } = useGetStudentsQuery(batchId);
    const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    if (isError) {
        return <div className="text-red-500 p-4">Failed to load students. Make sure backend is running.</div>
    }

    if (!students || students.length === 0) {
        return <div className="text-center p-8 text-muted-foreground">No students enrolled yet.</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>DOB</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students?.map((student: Student) => (
                        <TableRow key={student.id}>
                            <TableCell className="font-medium">
                                {student.firstname} {student.middletname} {student.lastname}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{student.email}</TableCell>
                            <TableCell>{student.dob || 'N/A'}</TableCell>
                            <TableCell>{student.address || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => deleteStudent(student.id)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
