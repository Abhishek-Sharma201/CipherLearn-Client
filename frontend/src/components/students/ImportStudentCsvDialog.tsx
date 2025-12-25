"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { useState } from "react"
import { useEnrollStudentsWithCSVMutation } from "@/redux/slices/students/studentsApi"
import { toast } from "sonner"

export function ImportStudentCsvDialog() {
    const [open, setOpen] = useState(false)
    const [enrollCsv, { isLoading }] = useEnrollStudentsWithCSVMutation()
    const [file, setFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        name: "Batch Enrollment",
        email: "admin@example.com", // Default or current user email
        batchId: "",
        firstname: "Admin",
        lastname: "User",
        middlename: "",
        dob: "2000-01-01",
        address: "Default"
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            toast.error("Please select a CSV file")
            return
        }

        const data = new FormData()
        data.append("file", file)
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value)
        })

        try {
            await enrollCsv(data).unwrap()
            toast.success("Students enrolled from CSV successfully")
            setOpen(false)
            setFile(null)
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to import CSV")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Students via CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to enroll multiple students at once.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file" className="text-right">
                                CSV File
                            </Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="batchId" className="text-right">
                                Batch ID
                            </Label>
                            <Input
                                id="batchId"
                                type="number"
                                value={formData.batchId}
                                onChange={handleChange}
                                className="col-span-3"
                                required
                            />
                        </div>
                        {/* Hidden fields required by backend validation if any, or just for context */}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Importing..." : "Import Students"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
