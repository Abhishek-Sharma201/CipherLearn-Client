"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useGetAttendanceQuery, useSaveBatchAttendanceMutation } from "@/redux/slices/attendance/attendanceApi"
import { useSelector, useDispatch } from "react-redux"
import { setBatch, setDate } from "@/redux/slices/attendance/attendanceSlice"
import { RootState } from "@/redux/store"

export function AttendanceMarker() {
    const dispatch = useDispatch();
    const { currentBatch, date } = useSelector((state: RootState) => state.attendance);

    const { data: students, isLoading } = useGetAttendanceQuery({ batch: currentBatch, date });
    const [saveAttendance, { isLoading: isSaving }] = useSaveBatchAttendanceMutation();

    const handleSave = async () => {
        await saveAttendance({ batch: currentBatch, date, students }).unwrap();
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={currentBatch}
                    onChange={(e) => dispatch(setBatch(e.target.value))}
                >
                    <option>Physics Class 11</option>
                    <option>Math Class 10</option>
                    <option>Chem Class 12</option>
                </select>

                <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={date}
                    onChange={(e) => dispatch(setDate(e.target.value))}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox />
                                </TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students?.map((student: any) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <Checkbox checked={student.status === 'Present'} />
                                    </TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${student.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {student.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex justify-end">
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!isSaving && <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Save Attendance
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
