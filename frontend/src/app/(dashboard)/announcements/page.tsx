"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Megaphone, Pin, Clock, Send, Trash, Edit2 } from "lucide-react"

const announcements = [
    { id: 1, title: "Physics Class Rescheduled", content: "The Physics class for batch 11 scheduled for tomorrow is moved to 10:00 AM.", dae: "2024-04-10", pinned: true, author: "Admin" },
    { id: 2, title: "Fee Submission Deadline", content: "Last date to submit fees for this month is 15th April.", dae: "2024-04-05", pinned: true, author: "Admin" },
    { id: 3, title: "New Biology Teacher", content: "We are happy to welcome Ms. Priya to our faculty.", dae: "2024-04-01", pinned: false, author: "Admin" },
    { id: 4, title: "Holiday Notice", content: "Institute will remain closed on account of Holi.", dae: "2024-03-20", pinned: false, author: "Admin" },
]

export default function AnnouncementsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">Keep your students and parents informed.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-4 order-last md:order-first">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Announcement</CardTitle>
                            <CardDescription>Post a new update to the notice board.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" placeholder="e.g. Class Reschedule" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Type your message here..." className="min-h-[120px]" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="pinned" />
                                <Label htmlFor="pinned">Pin to top</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="notify" defaultChecked />
                                <Label htmlFor="notify">Send WhatsApp Notification</Label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">
                                <Send className="mr-2 h-4 w-4" /> Post Announcement
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="md:col-span-8 space-y-4">
                    {announcements.map((item) => (
                        <Card key={item.id} className={item.pinned ? "border-indigo-200 bg-indigo-50/30" : ""}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {item.pinned && <Pin className="h-4 w-4 text-indigo-500 fill-indigo-500 rotate-45" />}
                                            <CardTitle className="text-lg">{item.title}</CardTitle>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{item.dae} • Posted by {item.author}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-indigo-600">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm dark:text-gray-300">{item.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
