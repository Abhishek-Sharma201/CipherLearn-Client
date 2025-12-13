"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, CreditCard, CalendarCheck, TrendingUp, Bell } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Line, LineChart, PieChart, Pie, Cell } from "recharts"

const data = [
    { name: "Jan", total: 1200 },
    { name: "Feb", total: 2100 },
    { name: "Mar", total: 1800 },
    { name: "Apr", total: 2400 },
    { name: "May", total: 2800 },
    { name: "Jun", total: 3200 },
]

const attendanceData = [
    { name: "Mon", present: 85, absent: 15 },
    { name: "Tue", present: 88, absent: 12 },
    { name: "Wed", present: 92, absent: 8 },
    { name: "Thu", present: 90, absent: 10 },
    { name: "Fri", present: 85, absent: 15 },
    { name: "Sat", present: 70, absent: 30 },
]

const batchDistribution = [
    { name: "Physics Class 11", value: 40 },
    { name: "Math Class 10", value: 30 },
    { name: "Chem Class 12", value: 45 },
    { name: "Bio Class 11", value: 25 },
]

const COLORS = ['#4f46e5', '#0d9488', '#f97316', '#8b5cf6'];

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Last updated: Today at 09:00 AM</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">245</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-teal-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                        <TrendingUp className="h-4 w-4 text-teal-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">3 New started this week</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,234</div>
                        <p className="text-xs text-muted-foreground">+5% overdue</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">88.5%</div>
                        <p className="text-xs text-muted-foreground">+2.1% from last week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Charts: Revenue */}
                <Card className="col-span-4 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Fee Collection Overview</CardTitle>
                        <CardDescription>Monthly revenue collection for current academic year</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
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
                                    tickFormatter={(value: number) => `$${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Charts: Attendance Trend */}
                <Card className="col-span-3 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Attendance Trend</CardTitle>
                        <CardDescription>Weekly student presence</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="present" stroke="var(--secondary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-3 lg:col-span-4 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your institute</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[
                                { user: "Rahul Sharma", action: "paid fees", time: "2 hours ago", amount: "+$200", avatar: "RS" },
                                { user: "Physics Batch A", action: "attendance marked", time: "4 hours ago", status: "Completed", avatar: "PB" },
                                { user: "Anjali Gupta", action: "joined New Batch", time: "Yesterday", status: "New Student", avatar: "AG" },
                                { user: "Math Batch 10", action: "Lecture Note Uploaded", time: "Yesterday", status: "Content", avatar: "MB" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                                        {item.avatar}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.user}</p>
                                        <p className="text-xs text-muted-foreground">{item.action}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm">
                                        {item.amount || item.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Announcements or Batch Stats */}
                <Card className="col-span-4 lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Student Distribution</CardTitle>
                        <CardDescription>Students per batch</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="h-[300px] w-full max-w-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={batchDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {batchDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            {batchDistribution.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span>{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
