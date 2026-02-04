"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useGetBatchDistributionQuery } from "@/redux/slices/analytics/analyticsApi"
import { Skeleton } from "@/components/ui/skeleton"
import { Users } from "lucide-react"
import { ChartTooltip, CHART_COLORS } from "./chart-config"

const PIE_COLORS = [
    "hsl(var(--foreground))",
    "hsl(var(--foreground) / 0.75)",
    "hsl(var(--foreground) / 0.55)",
    "hsl(var(--foreground) / 0.4)",
    "hsl(var(--foreground) / 0.25)",
    "hsl(var(--foreground) / 0.15)"
] as const

interface DistributionDataPoint {
    name: string
    value: number
    [key: string]: string | number
}

export function StudentDistribution() {
    const { data: distribution, isLoading } = useGetBatchDistributionQuery()

    if (isLoading) {
        return (
            <div className="col-span-5 rounded-lg border border-border bg-background flex flex-col h-full">
                <div className="p-5 border-b border-border">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex-1 p-5 flex items-center justify-center">
                    <Skeleton className="h-40 w-40 rounded-full" />
                </div>
            </div>
        )
    }

    const data: DistributionDataPoint[] = distribution?.map(d => ({
        name: d.batchName,
        value: d.studentCount
    })) || []

    const totalStudents = data.reduce((sum, d) => sum + d.value, 0)
    const hasData = totalStudents > 0

    if (!hasData) {
        return (
            <div className="col-span-5 rounded-lg border border-border bg-background flex flex-col h-full">
                <div className="p-5 border-b border-border">
                    <h3 className="text-sm font-medium text-foreground">Distribution</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Batch Allocation</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-5">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No Students Yet</p>
                    <p className="text-xs text-muted-foreground mt-1 text-center max-w-[180px]">
                        Add students to batches to see distribution
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="col-span-5 rounded-lg border border-border bg-background flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                    <h3 className="text-sm font-medium text-foreground">Distribution</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Batch Allocation</p>
                </div>
                <div className="text-right">
                    <div className="text-xl font-semibold tracking-tight tabular-nums">{totalStudents}</div>
                    <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
            </div>

            <div className="flex-1 p-5">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={75}
                                innerRadius={45}
                                dataKey="value"
                                paddingAngle={2}
                                stroke={CHART_COLORS.background}
                                strokeWidth={2}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null
                                    const entry = payload[0]
                                    const dataIndex = data.findIndex(d => d.name === entry.name)
                                    return (
                                        <ChartTooltip
                                            active={active}
                                            payload={[{
                                                name: entry.name as string,
                                                value: entry.value as number,
                                                color: PIE_COLORS[dataIndex % PIE_COLORS.length],
                                                dataKey: "value",
                                                payload: entry.payload as Record<string, unknown>
                                            }]}
                                            valueFormatter={(value) => `${value} students`}
                                        />
                                    )
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-4 border-t border-border mt-4">
                    {data.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 text-xs">
                            <span
                                className="h-2 w-2 rounded-full shrink-0"
                                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            />
                            <span className="text-muted-foreground">{entry.name}</span>
                            <span className="font-medium text-foreground tabular-nums">{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
