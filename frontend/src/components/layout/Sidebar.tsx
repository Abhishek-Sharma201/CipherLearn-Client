"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardList,
    FileText,
    Video,
    LogOut,
    ChevronLeft,
    ChevronRight,
    FileUp,
    Receipt,
    Settings,
    Bell,
    User,
    GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/redux/hooks"

interface NavItem {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    roles?: ('ADMIN' | 'TEACHER' | 'STUDENT')[]
}

// Navigation items with role-based access
const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/announcements", label: "Announcements", icon: Bell },
    { href: "/batches", label: "Batches", icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
    { href: "/students", label: "Students", icon: Users, roles: ['ADMIN', 'TEACHER'] },
    { href: "/attendance", label: "Attendance", icon: ClipboardList },
    { href: "/fees", label: "Fees", icon: Receipt },
    { href: "/assignments", label: "Assignments", icon: FileUp },
    { href: "/study-materials", label: "Materials", icon: GraduationCap },
    { href: "/notes", label: "Notes", icon: FileText, roles: ['ADMIN', 'TEACHER'] },
    { href: "/videos", label: "Videos", icon: Video },
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { user } = useAppSelector((state) => state.auth)

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
    }

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true // No roles specified means all users can access
        return user?.role && item.roles.includes(user.role)
    })

    return (
        <aside
            className={`sticky top-0 z-40 h-screen transition-all duration-200 border-r border-border shrink-0 bg-background ${
                isCollapsed ? 'w-14' : 'w-56'
            }`}
        >
            {/* Header - Vercel compact style */}
            <div className="flex h-14 items-center justify-between px-3 border-b border-border">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md flex items-center justify-center bg-foreground text-background font-semibold text-xs">
                            CL
                        </div>
                        <span className="font-semibold text-sm text-foreground">CipherLearn</span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                    {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </Button>
            </div>

            {/* Navigation - Vercel minimal spacing */}
            <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto gap-8 ">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors relative mb-0.5 ${
                                isActive
                                    ? 'text-foreground bg-secondary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            }`}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!isCollapsed && (
                                <span className="truncate">{item.label}</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User info (when not collapsed) */}
            {!isCollapsed && user && (
                <div className="px-3 py-2 border-t border-border">
                    <div className="flex items-center gap-2 px-2 py-1">
                        <div className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-foreground text-[10px] font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.role}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer - Logout */}
            <div className="p-2 border-t border-border">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className={`w-full h-8 justify-start gap-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${
                        isCollapsed ? 'justify-center px-0' : 'px-2'
                    }`}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </Button>
            </div>
        </aside>
    )
}
