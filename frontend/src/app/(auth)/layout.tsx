import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left: Branding & Illustration */}
            <div className="hidden md:flex flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900" />
                {/* Abstract Background Element */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute right-[-10%] top-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500 blur-[100px]" />
                    <div className="absolute left-[-10%] bottom-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500 blur-[100px]" />
                </div>

                <div className="relative z-10 flex items-center gap-2 font-bold text-2xl">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    CipherLearn
                </div>

                <div className="relative z-10 space-y-4 max-w-lg">
                    <blockquote className="space-y-2">
                        <p className="text-xl font-medium leading-relaxed font-[family-name:var(--font-heading)]">
                            "CipherLearn has completely transformed how I manage my tuition classes. The attendance tracking and automatic fee reminders saved me hours every week."
                        </p>
                        <footer className="tex-sm text-zinc-400">
                            — Sarah Williams, Math Tutor
                        </footer>
                    </blockquote>
                </div>

                <div className="relative z-10 text-sm text-zinc-400">
                    © 2024 CipherLearn Inc. All rights reserved.
                </div>
            </div>

            {/* Right: Form Area */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>
            </div>
        </div>
    )
}
