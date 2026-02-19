"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/ui/file-upload"
import { Upload, Loader2 } from "lucide-react"
import { useUploadNoteMutation } from "@/redux/slices/notes/notesApi"
import { useGetAllBatchesQuery } from "@/redux/slices/batches/batchesApi"
import { toast } from "sonner"

export function AddNoteDialog() {
    const [open, setOpen] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [formData, setFormData] = useState({ title: "", category: "", batchId: "" })

    const { data: batchesData } = useGetAllBatchesQuery()
    const batches = batchesData || []
    const [uploadNote, { isLoading }] = useUploadNoteMutation()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.batchId) {
            toast.error("Please fill in all required fields")
            return
        }

        const data = new FormData()
        data.append("title", formData.title)
        data.append("batchId", formData.batchId)
        if (formData.category) data.append("category", formData.category)
        files.forEach((file) => data.append("files", file))

        try {
            await uploadNote(data).unwrap()
            toast.success("Study material uploaded successfully")
            setOpen(false)
            setFormData({ title: "", category: "", batchId: "" })
            setFiles([])
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } }
            toast.error(err?.data?.message || "Failed to upload study material")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Material
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
                    <DialogTitle className="text-[17px] font-bold">Upload Study Material</DialogTitle>
                    <DialogDescription className="text-[14px] text-muted-foreground mt-1 leading-relaxed">
                        Share PDFs, notes, or handouts with your students. They can download them any time.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-[14px] font-semibold">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Chapter 4 — Quadratic Equations"
                                className="h-10 text-[14px]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="batchId" className="text-[14px] font-semibold">
                                    Batch <span className="text-destructive">*</span>
                                </Label>
                                <select
                                    id="batchId"
                                    value={formData.batchId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-[14px] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    required
                                >
                                    <option value="">Select batch...</option>
                                    {batches.map((batch: { id: number; name: string }) => (
                                        <option key={batch.id} value={batch.id}>{batch.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-[14px] font-semibold">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="e.g., Notes, Worksheet"
                                    className="h-10 text-[14px]"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[14px] font-semibold">Files</Label>
                            <FileUpload
                                files={files}
                                onChange={setFiles}
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                                maxFiles={5}
                                maxSize={10 * 1024 * 1024}
                                label="Drop files here or click to browse"
                                hint="PDF, Word, PowerPoint accepted"
                            />
                        </div>
                    </div>
                    <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                "Upload Material"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
