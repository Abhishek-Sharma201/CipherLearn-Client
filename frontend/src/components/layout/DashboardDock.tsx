"use client"

import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardCheck,
    Receipt,
    Settings,
} from "lucide-react"
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock"
import { useDockPreferences, AVAILABLE_APPS } from "@/hooks/useDockPreferences"
import { DockSettingsPanel } from "@/components/dock/DockSettingsPanel"
import { useState, useRef, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { useTeacherPermissions } from "@/hooks/useTeacherPermissions"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { siteConfig } from "@/config/siteConfig"

export function DashboardDock() {
    const pathname = usePathname()
    const router = useRouter()
    const { preferences, updatePreferences, resetPreferences, isMounted } = useDockPreferences()
    const [showSettings, setShowSettings] = useState(false)
    const settingsRef = useRef<HTMLDivElement>(null)

    // Close settings when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        setShowSettings(true)
    }

    const { hasPermission } = useTeacherPermissions()
    const role = useSelector((state: RootState) => state.auth.user?.role)
    const isAdmin = role === "ADMIN"
    const { features } = siteConfig

    if (!isMounted) return null;

    // Filter available apps based on selection order AND permissions
    const visibleApps = AVAILABLE_APPS.filter(app => {
        // Must be selected in preferences
        if (!preferences.selectedApps.includes(app.id)) return false;

        // Must pass permission checks
        if (app.id === 'fees') {
            return (features.fees || isAdmin) && hasPermission("canViewFees");
        }
        if (app.id === 'attendance') {
            return features.qrAttendance || isAdmin;
        }

        return true;
    });

    return (
        <div 
            className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 max-w-full"
            onContextMenu={handleContextMenu}
            ref={settingsRef}
        >
            <AnimatePresence>
                {showSettings && (
                    <DockSettingsPanel 
                        preferences={preferences} 
                        onUpdate={updatePreferences}
                        onReset={resetPreferences}
                    />
                )}
            </AnimatePresence>

            <Dock
                magnification={preferences.magnification}
                distance={preferences.distance}
                panelHeight={preferences.panelHeight}
                baseSize={preferences.baseSize}
                className="items-end pb-3 px-4 mx-auto rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-white/10 backdrop-blur-md shadow-2xl shadow-black/5"
            >
                {visibleApps.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                        <DockItem
                            key={item.id}
                            className="aspect-square rounded-full cursor-pointer bg-white/40 dark:bg-white/5 border border-white/20 shadow-sm"
                            onClick={() => router.push(item.href)}
                        >
                            <DockLabel>{item.label}</DockLabel>
                            <DockIcon>
                                <item.icon
                                    className={`h-full w-full p-1 transition-colors ${
                                        isActive
                                            ? "text-primary"
                                            : "text-neutral-600 dark:text-neutral-400"
                                    }`}
                                    strokeWidth={2.5}
                                />
                            </DockIcon>
                            {/* Active indicator dot */}
                            {isActive && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                            )}
                        </DockItem>
                    )
                })}
            </Dock>
        </div>
    )
}
