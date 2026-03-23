"use client"

import { useState, useCallback } from "react"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Lock, Zap, Trash2, Database, Users, Activity, Shield, Timer,
    Loader2, ArrowLeft, Copy, Check, CheckCircle2, XCircle,
    LayoutDashboard, AlertTriangle, ChevronRight, Calendar, Receipt,
    BookOpen, ClipboardCheck, FileText,
} from "lucide-react"
import { toast } from "sonner"
import {
    useMaintenanceAuthMutation,
    useMaintenanceSeedMutation,
    useMaintenanceStatusQuery,
    useMaintenanceCleanupMutation,
    useMaintenanceApiHealthMutation,
    useMaintenanceValidationMutation,
    useMaintenanceSecurityMutation,
    useMaintenanceDbIntegrityQuery,
    useMaintenanceLoadTestMutation,
    useMaintenanceEndpointsQuery,
    type SeedStudent,
    type HealthResult,
    type ValidationResult,
    type SecurityResult,
    type LoadTestResult,
} from "@/redux/slices/maintenance/maintenanceApi"
import { useGetAllBatchesQuery } from "@/redux/slices/batches/batchesApi"

// ── Navigation ────────────────────────────────────────────

type Panel = "overview" | "seed" | "api-health" | "validation" | "security" | "db-integrity" | "load-test" | "cleanup"

const NAV_ITEMS: { id: Panel; label: string; icon: any; group: string }[] = [
    { id: "overview",     label: "Overview",       icon: LayoutDashboard, group: "General" },
    { id: "seed",         label: "Seed Engine",    icon: Users,           group: "General" },
    { id: "api-health",   label: "API Health",     icon: Activity,        group: "Testing" },
    { id: "validation",   label: "Validation",     icon: CheckCircle2,    group: "Testing" },
    { id: "security",     label: "Security",       icon: Shield,          group: "Testing" },
    { id: "db-integrity", label: "DB Integrity",   icon: Database,        group: "Testing" },
    { id: "load-test",    label: "Load Test",      icon: Timer,           group: "Testing" },
    { id: "cleanup",      label: "Cleanup",        icon: Trash2,          group: "Danger" },
]

// ── Password Gate ─────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: (pw: string) => void }) {
    const [password, setPassword] = useState("")
    const [authenticate, { isLoading }] = useMaintenanceAuthMutation()
    const [shake, setShake] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await authenticate({ password }).unwrap()
            onUnlock(password)
        } catch {
            setShake(true)
            setTimeout(() => setShake(false), 500)
            toast.error("Access Denied")
        }
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className={`w-full max-w-sm transition-transform ${shake ? "animate-shake" : ""}`}>
                <div className="text-center mb-8 space-y-2">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Shield className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">QA Command Center</h1>
                    <p className="text-sm text-muted-foreground">Enter maintenance password to continue</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <Card className="p-5 space-y-4">
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Maintenance password" autoFocus className="h-11" autoComplete="new-password" />
                        <Button type="submit" disabled={isLoading || !password} className="w-full h-11">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                            Authenticate
                        </Button>
                    </Card>
                </form>
            </div>
        </div>
    )
}

// ── Shared Components ─────────────────────────────────────

function StatusBadge({ passed }: { passed: boolean }) {
    return (
        <Badge variant="outline" className={cn("text-[10px] font-semibold",
            passed ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" : "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
        )}>{passed ? "✓ PASS" : "✗ FAIL"}</Badge>
    )
}

function TimeBadge({ ms }: { ms: number }) {
    const color = ms < 200 ? "text-emerald-600 dark:text-emerald-400" : ms < 500 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
    return <span className={cn("text-xs font-medium tabular-nums", color)}>{ms}ms</span>
}

function SummaryCards({ items }: { items: { label: string; value: number | string; color?: string }[] }) {
    return (
        <div className={cn("grid gap-3", items.length <= 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4")}>
            {items.map(({ label, value, color }) => (
                <Card key={label} className="p-3 text-center">
                    <p className={cn("text-xl font-bold tabular-nums", color)}>{value}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</p>
                </Card>
            ))}
        </div>
    )
}

// ── Overview ──────────────────────────────────────────────

function OverviewPanel() {
    const { data: status } = useMaintenanceStatusQuery()
    const total = status ? Object.values(status).reduce((a, b) => a + b, 0) : 0
    const metrics = [
        { label: "Students", value: status?.students ?? 0, icon: Users, color: "text-blue-600 dark:text-blue-400" },
        { label: "Batches", value: status?.batches ?? 0, icon: Database, color: "text-amber-600 dark:text-amber-400" },
        { label: "Attendance", value: status?.attendances ?? 0, icon: Calendar, color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Fee Receipts", value: status?.feeReceipts ?? 0, icon: Receipt, color: "text-violet-600 dark:text-violet-400" },
        { label: "Lectures", value: status?.lectures ?? 0, icon: BookOpen, color: "text-cyan-600 dark:text-cyan-400" },
        { label: "Tests", value: status?.tests ?? 0, icon: ClipboardCheck, color: "text-pink-600 dark:text-pink-400" },
        { label: "Test Scores", value: status?.testScores ?? 0, icon: CheckCircle2, color: "text-orange-600 dark:text-orange-400" },
        { label: "Notes", value: status?.notes ?? 0, icon: FileText, color: "text-teal-600 dark:text-teal-400" },
    ]

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold">System Overview</h2>
                <p className="text-sm text-muted-foreground">Snapshot of all seed data across the system. Total: <strong>{total}</strong> records.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {metrics.map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-secondary shrink-0", color)}><Icon className="h-4 w-4" /></div>
                            <div className="min-w-0">
                                <p className="text-xl font-bold tabular-nums">{value}</p>
                                <p className="text-[10px] text-muted-foreground font-medium truncate">{label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {total === 0 && (
                <Card className="p-6 text-center border-dashed">
                    <Database className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No seed data. Use <strong>Seed Engine</strong> to generate test data.</p>
                </Card>
            )}
        </div>
    )
}

// ── Seed Engine ───────────────────────────────────────────

function SeedPanel({ password }: { password: string }) {
    const { data: batches = [] } = useGetAllBatchesQuery()
    const [seed, { isLoading }] = useMaintenanceSeedMutation()
    const { refetch } = useMaintenanceStatusQuery()
    const [count, setCount] = useState(10)
    const [batchId, setBatchId] = useState("")
    const [students, setStudents] = useState<SeedStudent[]>([])
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
    const [summary, setSummary] = useState<Record<string, number> | null>(null)

    const handleSeed = async () => {
        try {
            const r = await seed({ password, count, batchId: batchId && batchId !== "auto" ? parseInt(batchId) : undefined }).unwrap()
            setStudents(r.data.students)
            setSummary(r.data.summary)
            refetch()
            toast.success(`Seeded ${r.data.summary.students} students with all related data`)
        } catch (err: any) {
            toast.error("Seed failed", { description: err.data?.message || err.message })
        }
    }

    const copyCredentials = useCallback((email: string, pw: string, idx: number) => {
        navigator.clipboard.writeText(`${email} / ${pw}`)
        setCopiedIdx(idx)
        setTimeout(() => setCopiedIdx(null), 2000)
    }, [])

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold">Seed Engine</h2>
                <p className="text-sm text-muted-foreground">
                    Creates N students + batch, each with 15 days attendance, 2 months fee receipts, test scores, 5 lectures, 3 tests, 3 notes. All tagged <code className="text-primary font-medium">[SEED]</code>.
                </p>
            </div>
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Student Count</label>
                        <Input type="number" value={count} onChange={(e) => setCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))} min={1} max={500} className="h-10" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Batch</label>
                        <Select value={batchId} onValueChange={setBatchId}>
                            <SelectTrigger className="h-10"><SelectValue placeholder="Auto-create new" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="auto">Auto-create [SEED] Batch</SelectItem>
                                {batches.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button onClick={handleSeed} disabled={isLoading} className="w-full h-10">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                            {isLoading ? "Seeding..." : `Seed ${count} Students`}
                        </Button>
                    </div>
                </div>
            </Card>

            {summary && (
                <SummaryCards items={[
                    { label: "Students", value: summary.students },
                    { label: "Attendance", value: summary.attendances },
                    { label: "Fee Receipts", value: summary.feeReceipts },
                    { label: "Tests", value: summary.tests },
                    { label: "Test Scores", value: summary.testScores },
                    { label: "Lectures", value: summary.lectures },
                    { label: "Notes", value: summary.notes },
                    { label: "Batches", value: summary.batches },
                ]} />
            )}

            {students.length > 0 && (
                <Card className="overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-secondary/30">
                        <span className="text-sm font-medium">Credentials</span>
                        <Badge variant="secondary" className="text-[10px]">{students.length} accounts</Badge>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border">
                                <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground w-8">#</th>
                                <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Name</th>
                                <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Email</th>
                                <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Pass</th>
                                <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Batch</th>
                                <th className="px-3 py-2 w-8"></th>
                            </tr></thead>
                            <tbody>
                                {students.map((s, i) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-3 py-1.5 text-xs text-muted-foreground">{i + 1}</td>
                                        <td className="px-3 py-1.5 font-medium text-xs">{s.name}</td>
                                        <td className="px-3 py-1.5 text-xs text-muted-foreground">{s.email}</td>
                                        <td className="px-3 py-1.5 text-xs text-muted-foreground">{s.password}</td>
                                        <td className="px-3 py-1.5 text-xs text-muted-foreground truncate max-w-[120px]">{s.batchName.replace("[SEED] ", "")}</td>
                                        <td className="px-3 py-1.5">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCredentials(s.email, s.password, i)}>
                                                {copiedIdx === i ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}

// ── API Health ────────────────────────────────────────────

function ApiHealthPanel({ token }: { token: string }) {
    const [run, { isLoading }] = useMaintenanceApiHealthMutation()
    const [result, setResult] = useState<HealthResult | null>(null)

    const handleRun = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"
            const r = await run({ baseUrl, token }).unwrap()
            setResult(r.data)
            toast.success(`${r.data.passed}/${r.data.total} endpoints healthy`)
        } catch (err: any) { toast.error("Health check failed") }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">API Health Check</h2>
                    <p className="text-sm text-muted-foreground">Hits every GET endpoint, checks status code and response time.</p>
                </div>
                <Button onClick={handleRun} disabled={isLoading} size="sm">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
                    {isLoading ? "Running..." : "Run Check"}
                </Button>
            </div>
            {result && (
                <>
                    <SummaryCards items={[
                        { label: "Total", value: result.total },
                        { label: "Passed", value: result.passed, color: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Failed", value: result.failed, color: result.failed > 0 ? "text-red-600 dark:text-red-400" : undefined },
                    ]} />
                    <Card className="overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 bg-background"><tr className="border-b border-border bg-secondary/30">
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Method</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Endpoint</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Module</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Time</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Result</th>
                                </tr></thead>
                                <tbody>
                                    {result.results.map((r, i) => (
                                        <tr key={i} className={cn("border-b border-border/50", !r.passed && "bg-red-500/5")}>
                                            <td className="px-3 py-1.5"><Badge variant="outline" className="text-[9px]">{r.method}</Badge></td>
                                            <td className="px-3 py-1.5 text-muted-foreground">{r.path}</td>
                                            <td className="px-3 py-1.5 font-medium">{r.module}</td>
                                            <td className="px-3 py-1.5 tabular-nums">{r.status}</td>
                                            <td className="px-3 py-1.5"><TimeBadge ms={r.time} /></td>
                                            <td className="px-3 py-1.5"><StatusBadge passed={r.passed} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    )
}

// ── Validation Audit ──────────────────────────────────────

function ValidationPanel({ token }: { token: string }) {
    const [run, { isLoading }] = useMaintenanceValidationMutation()
    const [result, setResult] = useState<ValidationResult | null>(null)

    const handleRun = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"
            const r = await run({ baseUrl, token }).unwrap()
            setResult(r.data)
            toast.success(`${r.data.passed}/${r.data.total} validations enforced`)
        } catch { toast.error("Audit failed") }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Validation Audit</h2>
                    <p className="text-sm text-muted-foreground">Sends invalid payloads (empty body, bad email, missing fields) to every create endpoint. Expects 400 rejection.</p>
                </div>
                <Button onClick={handleRun} disabled={isLoading} size="sm">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {isLoading ? "Auditing..." : "Run Audit"}
                </Button>
            </div>
            {result && (
                <>
                    <SummaryCards items={[
                        { label: "Tests", value: result.total },
                        { label: "Properly Rejected", value: result.passed, color: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Leaked Through", value: result.failed, color: result.failed > 0 ? "text-red-600 dark:text-red-400" : undefined },
                    ]} />
                    <Card className="overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 bg-background"><tr className="border-b border-border bg-secondary/30">
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Module</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Endpoint</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Test Case</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Server Error</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Result</th>
                                </tr></thead>
                                <tbody>
                                    {result.results.map((r, i) => (
                                        <tr key={i} className={cn("border-b border-border/50", !r.passed && "bg-red-500/5")}>
                                            <td className="px-3 py-1.5 font-medium">{r.module}</td>
                                            <td className="px-3 py-1.5 text-muted-foreground">{r.path}</td>
                                            <td className="px-3 py-1.5 text-muted-foreground">{r.desc}</td>
                                            <td className="px-3 py-1.5 tabular-nums">{r.status}</td>
                                            <td className="px-3 py-1.5 text-muted-foreground max-w-[200px] truncate">{r.serverMessage || "—"}</td>
                                            <td className="px-3 py-1.5"><StatusBadge passed={r.passed} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    )
}

// ── Security Audit ────────────────────────────────────────

function SecurityPanel({ token }: { token: string }) {
    const [run, { isLoading }] = useMaintenanceSecurityMutation()
    const [result, setResult] = useState<SecurityResult | null>(null)

    const handleRun = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"
            const r = await run({ baseUrl, token }).unwrap()
            setResult(r.data)
            toast.success(`${r.data.passed}/${r.data.total} security checks passed`)
        } catch { toast.error("Audit failed") }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Security Audit</h2>
                    <p className="text-sm text-muted-foreground">Tests auth bypass: requests with no token, fake token, and admin-only route verification.</p>
                </div>
                <Button onClick={handleRun} disabled={isLoading} size="sm">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                    {isLoading ? "Scanning..." : "Run Audit"}
                </Button>
            </div>
            {result && (
                <>
                    <SummaryCards items={[
                        { label: "Tests", value: result.total },
                        { label: "Secure", value: result.passed, color: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Vulnerable", value: result.failed, color: result.failed > 0 ? "text-red-600 dark:text-red-400" : undefined },
                    ]} />
                    <Card className="overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="sticky top-0 bg-background"><tr className="border-b border-border bg-secondary/30">
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Test</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Module</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Endpoint</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Got</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Expected</th>
                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Result</th>
                                </tr></thead>
                                <tbody>
                                    {result.results.map((r, i) => (
                                        <tr key={i} className={cn("border-b border-border/50", !r.passed && "bg-red-500/5")}>
                                            <td className="px-3 py-1.5"><Badge variant="outline" className="text-[9px]">{r.test}</Badge></td>
                                            <td className="px-3 py-1.5 font-medium">{r.module}</td>
                                            <td className="px-3 py-1.5 text-muted-foreground">{r.path}</td>
                                            <td className="px-3 py-1.5 tabular-nums">{r.status}</td>
                                            <td className="px-3 py-1.5 text-muted-foreground">{r.expected}</td>
                                            <td className="px-3 py-1.5"><StatusBadge passed={r.passed} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </div>
    )
}

// ── DB Integrity ──────────────────────────────────────────

function DbIntegrityPanel() {
    const { data: result, isLoading, refetch } = useMaintenanceDbIntegrityQuery()

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Database Integrity</h2>
                    <p className="text-sm text-muted-foreground">Checks for orphan records, broken foreign keys, and duplicate data across all tables.</p>
                </div>
                <Button onClick={() => refetch()} disabled={isLoading} size="sm">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                    {isLoading ? "Checking..." : "Run Check"}
                </Button>
            </div>
            {result && (
                <>
                    <SummaryCards items={[
                        { label: "Checks", value: result.total },
                        { label: "Issues", value: result.issues, color: result.issues > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400" },
                    ]} />
                    <div className="space-y-2">
                        {result.checks.map((c, i) => (
                            <Card key={i} className={cn("p-3 flex items-center justify-between gap-4", !c.passed && "border-red-500/30 bg-red-500/5")}>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">{c.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{c.detail}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {c.count > 0 && <Badge variant="secondary" className="tabular-nums text-[10px]">{c.count}</Badge>}
                                    <StatusBadge passed={c.passed} />
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

// ── Load Test ─────────────────────────────────────────────

function LoadTestPanel({ token }: { token: string }) {
    const { data: endpoints = [] } = useMaintenanceEndpointsQuery()
    const [run, { isLoading }] = useMaintenanceLoadTestMutation()
    const [endpoint, setEndpoint] = useState("")
    const [concurrency, setConcurrency] = useState(5)
    const [iterations, setIterations] = useState(50)
    const [result, setResult] = useState<LoadTestResult | null>(null)

    const handleRun = async () => {
        if (!endpoint) { toast.error("Select an endpoint"); return }
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"
            const r = await run({ baseUrl, token, endpoint, concurrency, iterations }).unwrap()
            setResult(r.data)
            toast.success(`${r.data.requestsPerSecond} req/s, p95: ${r.data.p95Time}ms`)
        } catch { toast.error("Load test failed") }
    }

    const getEndpoints = endpoints.filter(e => e.method === "GET")

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold">Load Test</h2>
                <p className="text-sm text-muted-foreground">Fire concurrent requests to measure throughput, latency, and error rates.</p>
            </div>
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Endpoint</label>
                        <Select value={endpoint} onValueChange={setEndpoint}>
                            <SelectTrigger className="h-10"><SelectValue placeholder="Select endpoint" /></SelectTrigger>
                            <SelectContent>
                                {getEndpoints.map(e => <SelectItem key={e.path} value={e.path}>{e.module} — {e.path}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Concurrency</label>
                        <Input type="number" value={concurrency} onChange={e => setConcurrency(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))} className="h-10" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Iterations</label>
                        <Input type="number" value={iterations} onChange={e => setIterations(Math.max(1, Math.min(200, parseInt(e.target.value) || 1)))} className="h-10" />
                    </div>
                </div>
                <Button onClick={handleRun} disabled={isLoading} className="mt-3" size="sm">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Timer className="h-4 w-4 mr-2" />}
                    {isLoading ? "Testing..." : "Run Load Test"}
                </Button>
            </Card>

            {result && (
                <SummaryCards items={[
                    { label: "Requests", value: result.totalRequests },
                    { label: "Req/s", value: result.requestsPerSecond, color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Avg", value: `${result.avgTime}ms` },
                    { label: "p95", value: `${result.p95Time}ms`, color: result.p95Time > 500 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400" },
                    { label: "Min", value: `${result.minTime}ms` },
                    { label: "Max", value: `${result.maxTime}ms` },
                    { label: "Success", value: result.successful, color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Failed", value: result.failed, color: result.failed > 0 ? "text-red-600 dark:text-red-400" : undefined },
                ]} />
            )}
        </div>
    )
}

// ── Cleanup ───────────────────────────────────────────────

function CleanupPanel({ password }: { password: string }) {
    const { data: status, refetch } = useMaintenanceStatusQuery()
    const [cleanup, { isLoading }] = useMaintenanceCleanupMutation()
    const total = status ? Object.values(status).reduce((a, b) => a + b, 0) : 0

    const handleCleanup = async () => {
        try {
            const r = await cleanup({ password }).unwrap()
            const deleted = Object.values(r.data).reduce((a: number, b: number) => a + b, 0)
            refetch()
            toast.success(`Purged ${deleted} records`)
        } catch (err: any) { toast.error("Cleanup failed") }
    }

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-lg font-semibold">Cleanup</h2>
                <p className="text-sm text-muted-foreground">Delete all <code className="text-primary font-medium">[SEED]</code>-tagged records from every table. Real data is never touched.</p>
            </div>
            {total === 0 ? (
                <Card className="p-6 text-center border-dashed">
                    <Trash2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No seed data to clean up.</p>
                </Card>
            ) : (
                <Card className="p-4 border-destructive/30">
                    <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium">Destructive Action</p>
                            <p className="text-xs text-muted-foreground mt-0.5">This will permanently delete <strong>{total}</strong> seed records across all tables. Cannot be undone.</p>
                        </div>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isLoading} size="sm">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                Delete All Seed Data ({total})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Cleanup</AlertDialogTitle>
                                <AlertDialogDescription>Permanently delete {total} seed records. Real data is safe.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCleanup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </Card>
            )}
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────

export default function MaintenancePage() {
    const { user, token: authToken } = useAppSelector((state) => state.auth)
    const router = useRouter()
    const [unlocked, setUnlocked] = useState(false)
    const [password, setPassword] = useState("")
    const [activePanel, setActivePanel] = useState<Panel>("overview")

    if (user?.role !== "ADMIN") {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h1 className="text-xl font-bold">Access Restricted</h1>
                    <p className="text-sm text-muted-foreground">Admin privileges required.</p>
                    <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>← Back to Settings</Button>
                </div>
            </div>
        )
    }

    if (!unlocked) return <PasswordGate onUnlock={(pw) => { setPassword(pw); setUnlocked(true) }} />

    const groups = [...new Set(NAV_ITEMS.map(n => n.group))]

    return (
        <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="w-[200px] shrink-0 space-y-4 sticky top-24 self-start">
                <button onClick={() => router.push("/settings")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1">
                    <ArrowLeft className="h-3 w-3" /> Settings
                </button>
                <p className="text-sm font-bold">QA Center</p>
                {groups.map(group => (
                    <div key={group}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">{group}</p>
                        <div className="space-y-0.5">
                            {NAV_ITEMS.filter(n => n.group === group).map(nav => {
                                const active = activePanel === nav.id
                                return (
                                    <button key={nav.id} onClick={() => setActivePanel(nav.id)}
                                        className={cn("w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all",
                                            active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                        )}>
                                        <nav.icon className="h-3.5 w-3.5 shrink-0" />
                                        <span>{nav.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {activePanel === "overview" && <OverviewPanel />}
                {activePanel === "seed" && <SeedPanel password={password} />}
                {activePanel === "api-health" && <ApiHealthPanel token={authToken || ""} />}
                {activePanel === "validation" && <ValidationPanel token={authToken || ""} />}
                {activePanel === "security" && <SecurityPanel token={authToken || ""} />}
                {activePanel === "db-integrity" && <DbIntegrityPanel />}
                {activePanel === "load-test" && <LoadTestPanel token={authToken || ""} />}
                {activePanel === "cleanup" && <CleanupPanel password={password} />}
            </div>
        </div>
    )
}
