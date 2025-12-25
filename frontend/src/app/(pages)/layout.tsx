"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { token } = useAppSelector((state) => state.auth)
    const router = useRouter()
    const [isClient, setIsClient] = useState(false)

    // Wait for client-side hydration to complete
    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        // Only check auth after client-side hydration
        if (isClient && !token) {
            router.push("/login")
        }
    }, [isClient, token, router])

    // Show nothing until client-side hydration is complete
    if (!isClient || !token) {
        return null
    }

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
