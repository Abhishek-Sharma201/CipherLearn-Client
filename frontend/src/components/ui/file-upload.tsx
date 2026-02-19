"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, X, FileText, File, ImageIcon, Video, Music, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

function getFileTypeIcon(file: File) {
    if (file.type.startsWith("image/")) return ImageIcon
    if (file.type.startsWith("video/")) return Video
    if (file.type.startsWith("audio/")) return Music
    if (file.type === "application/pdf") return FileText
    return File
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FileUploadProps {
    files: File[]
    onChange: (files: File[]) => void
    accept?: string
    maxFiles?: number
    /** Max file size in bytes — default 10MB */
    maxSize?: number
    className?: string
    label?: string
    hint?: string
    disabled?: boolean
}

export function FileUpload({
    files,
    onChange,
    accept,
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024,
    className,
    label = "Drop files here or click to upload",
    hint,
    disabled = false,
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [errors, setErrors] = useState<string[]>([])

    const processFiles = useCallback(
        (incoming: FileList | File[]) => {
            const arr = Array.from(incoming)
            const errs: string[] = []
            const valid: File[] = []

            for (const file of arr) {
                if (files.length + valid.length >= maxFiles) {
                    errs.push(`Maximum ${maxFiles} file${maxFiles !== 1 ? "s" : ""} allowed`)
                    break
                }
                if (file.size > maxSize) {
                    errs.push(`"${file.name}" is too large (max ${formatFileSize(maxSize)})`)
                    continue
                }
                valid.push(file)
            }

            setErrors(errs)
            if (valid.length > 0) {
                onChange([...files, ...valid])
            }
        },
        [files, maxFiles, maxSize, onChange]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            if (!disabled) processFiles(e.dataTransfer.files)
        },
        [disabled, processFiles]
    )

    const handleRemove = (index: number) => {
        onChange(files.filter((_, i) => i !== index))
        setErrors([])
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files)
        e.target.value = ""
    }

    const isAtLimit = files.length >= maxFiles

    return (
        <div className={cn("space-y-2.5", className)}>
            {/* Drop zone */}
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200",
                    isDragging && !disabled
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : isAtLimit || disabled
                            ? "border-border/40 bg-muted/20 opacity-60 cursor-not-allowed"
                            : "border-border hover:border-primary/50 hover:bg-secondary/40 cursor-pointer",
                    files.length === 0 ? "py-8 px-6" : "py-5 px-6"
                )}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); if (!disabled && !isAtLimit) setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => !disabled && !isAtLimit && inputRef.current?.click()}
            >
                <div className={cn(
                    "h-11 w-11 rounded-2xl flex items-center justify-center transition-colors",
                    isDragging ? "bg-primary/15" : "bg-muted"
                )}>
                    <Upload className={cn(
                        "h-5 w-5 transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground"
                    )} />
                </div>

                <div className="text-center">
                    <p className={cn(
                        "text-[14px] font-semibold transition-colors",
                        isDragging ? "text-primary" : "text-foreground"
                    )}>
                        {isAtLimit ? `Maximum ${maxFiles} files reached` : label}
                    </p>
                    {hint && !isAtLimit && (
                        <p className="text-[13px] text-muted-foreground mt-0.5">{hint}</p>
                    )}
                    {!isAtLimit && (
                        <p className="text-[12.5px] text-muted-foreground/70 mt-1">
                            Up to {maxFiles} file{maxFiles !== 1 ? "s" : ""} · Max {formatFileSize(maxSize)} each
                        </p>
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    multiple={maxFiles > 1}
                    accept={accept}
                    disabled={disabled || isAtLimit}
                    onChange={handleInputChange}
                />
            </div>

            {/* Error messages */}
            {errors.length > 0 && (
                <div className="space-y-1">
                    {errors.map((err, i) => (
                        <div key={i} className="flex items-center gap-2 text-[13px] text-destructive">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {err}
                        </div>
                    ))}
                </div>
            )}

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-1.5">
                    {files.map((file, index) => {
                        const Icon = getFileTypeIcon(file)
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5 group"
                            >
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13.5px] font-semibold text-foreground truncate leading-tight">
                                        {file.name}
                                    </p>
                                    <p className="text-[12px] text-muted-foreground leading-tight">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
