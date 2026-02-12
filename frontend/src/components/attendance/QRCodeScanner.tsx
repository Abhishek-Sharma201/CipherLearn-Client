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

interface QRCodeScannerProps {
    studentId: number
}

export function QRCodeScanner({ studentId }: QRCodeScannerProps) {
    // QR attendance is temporarily disabled
    // Return null or a disabled placeholder
    return null
}

// Original implementation (commented out for reference):
/*
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Camera, Loader2, CheckCircle, XCircle, ScanLine } from "lucide-react"
import { useMarkQRAttendanceMutation } from "@/redux/slices/attendance/attendanceApi"
import { toast } from "sonner"
import { Html5Qrcode } from "html5-qrcode"

export function QRCodeScanner({ studentId }: QRCodeScannerProps) {
    const [open, setOpen] = useState(false)
    const [qrData, setQrData] = useState("")
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const scannerContainerId = "qr-scanner-container"

    // ... rest of implementation
}
*/
