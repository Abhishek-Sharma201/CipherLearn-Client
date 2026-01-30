"use client"

import { useAppSelector } from "@/redux/hooks"
import { StudentAppProfile } from "@/components/profile/StudentAppProfile"
import { Card } from "@/components/ui/card"
import { User, Settings } from "lucide-react"

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth)

    // For student users, show the student profile
    if (user?.role === "STUDENT") {
        return (
            <div className="py-8 px-6 max-w-2xl mx-auto animate-in fade-in duration-500">
                <div className="border-b border-border/40 pb-8 mb-8">
                    <h1 className="text-2xl font-bold tracking-tighter text-foreground">
                        My Profile
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">
                        View your personal information and academic details.
                    </p>
                </div>
                <StudentAppProfile />
            </div>
        )
    }

    // For admin/teacher users, show a different profile view
    return (
        <div className="py-8 px-6 max-w-2xl mx-auto animate-in fade-in duration-500">
            <div className="border-b border-border/40 pb-8 mb-8">
                <h1 className="text-2xl font-bold tracking-tighter text-foreground">
                    My Profile
                </h1>
                <p className="text-muted-foreground mt-1 text-sm font-medium">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Card className="p-6 border-border/60">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-xl">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-foreground/5 text-foreground/70">
                            {user?.role}
                        </span>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                User ID
                            </p>
                            <p className="text-sm font-medium">{user?.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                                Account Type
                            </p>
                            <p className="text-sm font-medium capitalize">{user?.role?.toLowerCase()}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
