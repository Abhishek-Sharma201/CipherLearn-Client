"use client"

import { PermissionGate } from "@/components/layout/PermissionGate"

import { useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { StudyMaterialsList } from "@/components/study-materials/StudyMaterialsList"
import { AddStudyMaterialDialog } from "@/components/study-materials/AddStudyMaterialDialog"
import { useGetAllBatchesQuery } from "@/redux/slices/batches/batchesApi"
import { useGetStudyMaterialCategoriesQuery } from "@/redux/slices/studyMaterials/studyMaterialsApi"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"

export default function StudyMaterialsPage() {
    const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined)
    const [selectedCategory, setSelectedCategory] = useState<string>("")

    const { user } = useSelector((state: RootState) => state.auth)
    const isAdmin = user?.role === "ADMIN" || user?.role === "TEACHER"

    const { data: batchesData } = useGetAllBatchesQuery()
    const batches = batchesData || []

    const { data: categoriesData } = useGetStudyMaterialCategoriesQuery()
    const categories = categoriesData?.data || []

    return (
        <PermissionGate permissionKey="canManageStudyMaterials" featureName="Study Materials">
        <div className="space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Study Materials</h1>
                    <p className="text-[14.5px] text-muted-foreground mt-1 leading-relaxed">
                        Textbooks, worksheets, and extra resources for your students.
                    </p>
                </div>
                {isAdmin && <AddStudyMaterialDialog />}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
                <Select
                    value={selectedBatchId?.toString() || "all"}
                    onValueChange={(v) => setSelectedBatchId(v === "all" ? undefined : Number(v))}
                >
                    <SelectTrigger className="h-9 w-[180px] text-[13.5px]">
                        <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {batches.map((batch) => (
                            <SelectItem key={batch.id} value={String(batch.id)}>
                                {batch.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {categories.length > 0 && (
                    <Select
                        value={selectedCategory || "all"}
                        onValueChange={(v) => setSelectedCategory(v === "all" ? "" : v)}
                    >
                        <SelectTrigger className="h-9 w-[180px] text-[13.5px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <Card className="!p-0 overflow-hidden">
                <StudyMaterialsList
                    batchId={selectedBatchId}
                    category={selectedCategory || undefined}
                    isAdmin={isAdmin}
                />
            </Card>
        </div>
        </PermissionGate>
    )
}
