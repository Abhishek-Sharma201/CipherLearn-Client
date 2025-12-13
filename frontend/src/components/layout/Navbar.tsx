"use client"

import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Navbar() {
    return (
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm z-30">
            <Button variant="outline" size="icon" className="md:hidden shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>

            <div className="flex items-center gap-2">
                <span className="font-semibold text-lg hidden md:block">Sky High Institute</span>
            </div>

            <div className="flex flex-1 items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search students, batches..."
                            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-muted/50 focus:bg-background transition-colors"
                        />
                    </div>
                </form>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border-2 border-background" />
                        <span className="sr-only">Notifications</span>
                    </Button>

                    <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border">
                        <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            SH
                        </div>
                        <span className="sr-only">Profile</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}
