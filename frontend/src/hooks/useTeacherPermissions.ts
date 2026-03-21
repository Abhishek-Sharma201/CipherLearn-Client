"use client"

import { useAppSelector } from "@/redux/hooks"
import { useGetSettingsQuery, type TeacherPermissions } from "@/redux/slices/settings/settingsApi"

const ALL_GRANTED: TeacherPermissions = {
    canManageLectures: true,
    canUploadNotes: true,
    canUploadVideos: true,
    canManageAssignments: true,
    canViewFees: true,
    canManageStudyMaterials: true,
    canSendAnnouncements: true,
    canViewAnalytics: true,
    canExportData: true,
}

const ALL_DENIED: TeacherPermissions = {
    canManageLectures: false,
    canUploadNotes: false,
    canUploadVideos: false,
    canManageAssignments: false,
    canViewFees: false,
    canManageStudyMaterials: false,
    canSendAnnouncements: false,
    canViewAnalytics: false,
    canExportData: false,
}

export function useTeacherPermissions() {
    const { user } = useAppSelector((state) => state.auth)
    const isAdmin = user?.role === "ADMIN"
    const isTeacher = user?.role === "TEACHER"

    // Only fetch settings if user is a teacher (admins always have full access)
    const { data: settings, isLoading } = useGetSettingsQuery(undefined, {
        skip: !isTeacher,
    })

    const permissions: TeacherPermissions = isAdmin
        ? ALL_GRANTED
        : (settings?.teacherPermissions ?? ALL_DENIED)

    const hasPermission = (key: keyof TeacherPermissions): boolean => {
        if (isAdmin) return true
        if (!isTeacher) return true // non-teacher roles handled elsewhere
        return permissions[key] ?? false
    }

    return {
        permissions,
        hasPermission,
        isLoading: isTeacher && isLoading,
        isAdmin,
        isTeacher,
    }
}
