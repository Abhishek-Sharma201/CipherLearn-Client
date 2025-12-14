"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Mail, Loader2, Check } from "lucide-react"
import { useGetFeesQuery, useSendReminderMutation } from "@/redux/slices/fees/feesApi"

export function FeesTable() {
    const { data: fees, isLoading } = useGetFeesQuery({});
    const [sendReminder, { isLoading: isSending }] = useSendReminderMutation();

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Payment Progress</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {fees?.map((fee: any) => (
                    <TableRow key={fee.id}>
                        <TableCell className="font-medium">{fee.name}</TableCell>
                        <TableCell>{fee.batch}</TableCell>
                        <TableCell className="w-[200px]">
                            <div className="flex items-center gap-2">
                                <Progress value={fee.progress} className="h-2" />
                                <span className="text-xs text-muted-foreground">{fee.progress}%</span>
                            </div>
                        </TableCell>
                        <TableCell>₹{fee.amount}</TableCell>
                        <TableCell>{fee.date}</TableCell>
                        <TableCell>
                            <Badge variant={fee.status === 'Paid' ? 'default' : fee.status === 'Pending' ? 'secondary' : 'destructive'}>
                                {fee.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {fee.status !== 'Paid' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                    onClick={() => sendReminder(fee.id)}
                                    disabled={isSending}
                                >
                                    <Mail className="mr-2 h-3 w-3" /> Remind
                                </Button>
                            )}
                            {fee.status === 'Paid' && (
                                <div className="flex justify-end items-center text-green-600 text-sm font-medium px-4">
                                    <Check className="mr-1 h-4 w-4" /> Paid
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
