"use client"

import { Lock, ShieldAlert } from "lucide-react"
import { useTeacherPermissions } from "@/hooks/useTeacherPermissions"
import type { TeacherPermissions } from "@/redux/slices/settings/settingsApi"

interface PermissionGateProps {
    permissionKey: keyof TeacherPermissions
    featureName: string
    children: React.ReactNode
}

export function PermissionGate({ permissionKey, featureName, children }: PermissionGateProps) {
    const { hasPermission, isLoading, isAdmin } = useTeacherPermissions()

    // Admins always pass through
    if (isAdmin) return <>{children}</>

    // Show skeleton while loading permissions
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        )
    }

    // Permission granted — render children
    if (hasPermission(permissionKey)) {
        return <>{children}</>
    }

    // Permission denied — show request access card
    return (
        <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
            <div className="max-w-md w-full mx-auto text-center space-y-6">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
                    <Lock className="h-7 w-7 text-muted-foreground" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        {featureName}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        This feature requires admin approval. Please contact your administrator to enable access.
                    </p>
                </div>

                {/* Info card */}
                <div className="rounded-lg border border-border bg-card p-4 mx-auto max-w-xs">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="text-left">
                            <p className="text-[13px] font-medium text-foreground">Access Restricted</p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                Your admin has not enabled <span className="font-medium text-foreground">{featureName}</span> for teacher accounts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
