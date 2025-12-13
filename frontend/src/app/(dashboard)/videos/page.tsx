"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Video, PlayCircle, MoreVertical, UploadCloud } from "lucide-react"

const videos = [
    { id: 1, title: "Physics: Laws of Motion", batch: "Physics Class 11", duration: "45:30", views: 245, date: "2 days ago", thumbnail: "bg-indigo-100" },
    { id: 2, title: "Math: Quadratic Equations", batch: "Math Class 10", duration: "38:15", views: 120, date: "3 days ago", thumbnail: "bg-teal-100" },
    { id: 3, title: "Chemistry: Periodic Table", batch: "Chem Class 12", duration: "52:00", views: 310, date: "1 week ago", thumbnail: "bg-orange-100" },
    { id: 4, title: "Biology: Cell Structure", batch: "Bio Class 11", duration: "41:45", views: 180, date: "1 week ago", thumbnail: "bg-purple-100" },
]

export default function VideosPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Video Lectures</h1>
                    <p className="text-muted-foreground">Manage and assign video content to batches.</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700">
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Video
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {videos.map((video) => (
                    <Card key={video.id} className="group overflow-hidden">
                        <div className={`aspect-video w-full ${video.thumbnail} flex items-center justify-center relative`}>
                            <Video className="h-12 w-12 text-muted-foreground/50" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                                <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                {video.duration}
                            </span>
                        </div>
                        <CardHeader className="p-4">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold leading-tight line-clamp-2">{video.title}</h3>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{video.batch}</p>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between">
                            <span>{video.views} views</span>
                            <span>{video.date}</span>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
