"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2, Calendar, Loader2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { useGetNotesQuery, useDeleteNoteMutation } from "@/redux/slices/notes/notesApi"
import { Note } from "@/types"

export function NotesList() {
    const { data: notes, isLoading } = useGetNotesQuery({});
    const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Date Uploaded</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {notes?.map((note: Note) => (
                        <TableRow key={note.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">{note.title}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{note.batch}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{note.size}</TableCell>
                            <TableCell className="text-muted-foreground">{note.date}</TableCell>
                            <TableCell className="text-muted-foreground">{note.downloads}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteNote(note.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
