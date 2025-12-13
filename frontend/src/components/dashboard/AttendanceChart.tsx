"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const attendanceData = [
    { day: "Mon", present: 90 },
    { day: "Tue", present: 85 },
    { day: "Wed", present: 95 },
    { day: "Thu", present: 88 },
    { day: "Fri", present: 92 },
    { day: "Sat", present: 80 },
]

export function AttendanceChart() {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>Weekly student attendance average.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={attendanceData}>
                            <XAxis
                                dataKey="day"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="present"
                                strokeWidth={2}
                                activeDot={{ r: 8 }}
                                className="stroke-primary"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
