"use client"

// =====================
// QR CODE ATTENDANCE - TEMPORARILY DISABLED
// =====================
// QR attendance feature is currently disabled.
// Manual attendance marking by teachers/admins is the only supported method.
//
// To re-enable:
// 1. Uncomment the code below
// 2. Re-enable the API endpoints in attendanceApi.ts
// 3. Re-enable the backend routes

import { QrCode } from "lucide-react"

interface QRCodeGeneratorProps {
    selectedBatchId?: number
}

export function QRCodeGenerator({ selectedBatchId }: QRCodeGeneratorProps) {
    // QR attendance is temporarily disabled
    // Return null or a disabled placeholder
    return null
}

// Original implementation (commented out for reference):
/*
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { QrCode, Loader2, RefreshCw, Download, Share2, CheckCircle, Clock, Calendar } from "lucide-react"
import { useLazyGenerateQRCodeQuery } from "@/redux/slices/attendance/attendanceApi"
import { useGetAllBatchesQuery } from "@/redux/slices/batches/batchesApi"
import type { Batch } from "@/types"
import { toast } from "sonner"

export function QRCodeGenerator({ selectedBatchId }: QRCodeGeneratorProps) {
    const [open, setOpen] = useState(false)
    const [batchId, setBatchId] = useState<number | undefined>(selectedBatchId)

    const { data: batchesData } = useGetAllBatchesQuery()
    const batches = batchesData || []
    const [generateQR, { data: qrData, isLoading, isFetching }] = useLazyGenerateQRCodeQuery()

    const handleGenerate = async () => {
        if (!batchId) {
            toast.error("Please select a batch")
            return
        }

        try {
            await generateQR(batchId).unwrap()
            toast.success("QR code generated successfully")
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to generate QR code")
        }
    }

    // ... rest of implementation
}
*/
