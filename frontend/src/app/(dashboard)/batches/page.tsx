"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Calendar, MoreHorizontal, Plus } from "lucide-react"

const batches = [
    { id: 1, name: "Physics Class 11 - Morning", subject: "Physics", students: 45, time: "08:00 AM - 09:30 AM", days: "Mon, Wed, Fri", status: "Active" },
    { id: 2, name: "Math Class 10 - Evening", subject: "Mathematics", students: 32, time: "05:00 PM - 06:30 PM", days: "Tue, Thu, Sat", status: "Active" },
    { id: 3, name: "Chemistry Class 12 - Weekend", subject: "Chemistry", students: 28, time: "10:00 AM - 01:00 PM", days: "Sat, Sun", status: "Filling Fast" },
    { id: 4, name: "Biology NEET Prep", subject: "Biology", students: 50, time: "04:00 PM - 06:00 PM", days: "Daily", status: "Full" },
]

export default function BatchesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
                    <p className="text-muted-foreground">Manage your classes and schedules.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Create Batch
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Input
                        type="search"
                        placeholder="Search batches..."
                        className="bg-background"
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {batches.map((batch) => (
                    <Card key={batch.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="mb-2">{batch.subject}</Badge>
                                    <CardTitle className="text-xl">{batch.name}</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="mr-2 h-4 w-4" />
                                {batch.students} Students
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-2 h-4 w-4" />
                                {batch.time}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-2 h-4 w-4" />
                                {batch.days}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center border-t pt-4">
                            <Badge variant={batch.status === 'Full' ? 'destructive' : batch.status === 'Filling Fast' ? 'secondary' : 'default'}>
                                {batch.status}
                            </Badge>
                            <Button variant="outline" size="sm">View Details</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
