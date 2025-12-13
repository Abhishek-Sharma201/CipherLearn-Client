"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { FileText, Download, Trash2, Upload, File } from "lucide-react"

const notes = [
    { id: 1, name: "Physics Chapter 1 - Mechanics.pdf", batch: "Physics Class 11", size: "2.4 MB", date: "2024-04-01", downloads: 45 },
    { id: 2, name: "Math Formulas Cheat Sheet.docx", batch: "Math Class 10", size: "1.1 MB", date: "2024-03-28", downloads: 32 },
    { id: 3, name: "Organic Chemistry Notes.pdf", batch: "Chem Class 12", size: "4.5 MB", date: "2024-03-25", downloads: 56 },
    { id: 4, name: "Biology Diagrams.pdf", batch: "Bio Class 11", size: "3.2 MB", date: "2024-03-20", downloads: 28 },
]

export default function NotesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Study Material</h1>
                    <p className="text-muted-foreground">Upload and manage notes for your students.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                    <Upload className="mr-2 h-4 w-4" /> Upload Notes
                </Button>
            </div>

            <Card className="border-dashed border-2 bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="p-4 bg-background rounded-full shadow-sm">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-lg">Click to upload or drag and drop</h3>
                        <p className="text-sm text-muted-foreground">PDF, DOCX, PPTX up to 10MB</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Files</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Batch</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Date Uploaded</TableHead>
                                <TableHead>Downloads</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notes.map((note) => (
                                <TableRow key={note.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        {note.name}
                                    </TableCell>
                                    <TableCell>{note.batch}</TableCell>
                                    <TableCell className="text-muted-foreground">{note.size}</TableCell>
                                    <TableCell>{note.date}</TableCell>
                                    <TableCell>{note.downloads}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" title="Download">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
