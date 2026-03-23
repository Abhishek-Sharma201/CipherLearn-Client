"use client"
import { useState, useCallback } from "react"
import { useAppSelector } from "@/redux/hooks"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Lock, Zap, Trash2, Database, Users, Activity, Shield, Timer, Loader2, ArrowLeft, Copy, Check, CheckCircle2, XCircle, LayoutDashboard, AlertTriangle, Calendar, Receipt, BookOpen, ClipboardCheck, FileText, Send, Code } from "lucide-react"
import { toast } from "sonner"
import { useMaintenanceAuthMutation, useMaintenanceSeedMutation, useMaintenanceStatusQuery, useMaintenanceSeedDataQuery, useMaintenanceCleanupMutation, useMaintenanceApiHealthMutation, useMaintenanceValidationMutation, useMaintenanceSecurityMutation, useMaintenanceDbIntegrityQuery, useMaintenanceLoadTestMutation, useMaintenancePlaygroundMutation, useMaintenanceEndpointsQuery, type SeedStudent, type HealthResult, type ValidationResult, type SecurityResult, type LoadTestResult, type PlaygroundResult } from "@/redux/slices/maintenance/maintenanceApi"
import { useGetAllBatchesQuery } from "@/redux/slices/batches/batchesApi"

type Panel = "overview"|"seed"|"api-health"|"validation"|"security"|"db-integrity"|"load-test"|"playground"|"cleanup"
const NAV: {id:Panel;label:string;icon:any;group:string}[] = [
  {id:"overview",label:"Overview",icon:LayoutDashboard,group:"General"},
  {id:"seed",label:"Seed Engine",icon:Users,group:"General"},
  {id:"api-health",label:"API Health",icon:Activity,group:"Testing"},
  {id:"validation",label:"Validation",icon:CheckCircle2,group:"Testing"},
  {id:"security",label:"Security",icon:Shield,group:"Testing"},
  {id:"db-integrity",label:"DB Integrity",icon:Database,group:"Testing"},
  {id:"load-test",label:"Load Test",icon:Timer,group:"Testing"},
  {id:"playground",label:"API Playground",icon:Code,group:"Testing"},
  {id:"cleanup",label:"Cleanup",icon:Trash2,group:"Danger"},
]

function StatusBadge({passed}:{passed:boolean}) {
  return <Badge variant="outline" className={cn("text-[10px] font-semibold", passed?"bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400":"bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400")}>{passed?"✓ PASS":"✗ FAIL"}</Badge>
}
function TimeBadge({ms}:{ms:number}) {
  const c = ms<200?"text-emerald-600 dark:text-emerald-400":ms<500?"text-amber-600 dark:text-amber-400":"text-red-600 dark:text-red-400"
  return <span className={cn("text-xs font-medium tabular-nums",c)}>{ms}ms</span>
}
function StatCards({items}:{items:{label:string;value:number|string;color?:string}[]}) {
  return <div className={cn("grid gap-3",items.length<=3?"grid-cols-3":"grid-cols-2 md:grid-cols-4")}>{items.map(({label,value,color})=><Card key={label} className="p-3 text-center"><p className={cn("text-xl font-bold tabular-nums",color)}>{value}</p><p className="text-[10px] text-muted-foreground font-medium mt-0.5">{label}</p></Card>)}</div>
}

function PasswordGate({onUnlock}:{onUnlock:(pw:string)=>void}) {
  const [pw,setPw]=useState(""); const [auth,{isLoading}]=useMaintenanceAuthMutation(); const [shake,setShake]=useState(false)
  const go=async(e:React.FormEvent)=>{e.preventDefault();try{await auth({password:pw}).unwrap();onUnlock(pw)}catch{setShake(true);setTimeout(()=>setShake(false),500);toast.error("Access Denied")}}
  return <div className="min-h-[60vh] flex items-center justify-center"><div className={`w-full max-w-sm transition-transform ${shake?"animate-shake":""}`}><div className="text-center mb-8 space-y-2"><div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Shield className="h-7 w-7 text-primary"/></div><h1 className="text-2xl font-bold tracking-tight">QA Command Center</h1><p className="text-sm text-muted-foreground">Enter maintenance password</p></div><form onSubmit={go}><Card className="p-5 space-y-4"><Input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" autoFocus className="h-11" autoComplete="new-password"/><Button type="submit" disabled={isLoading||!pw} className="w-full h-11">{isLoading?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:<Lock className="h-4 w-4 mr-2"/>}Authenticate</Button></Card></form></div></div>
}

function OverviewPanel() {
  const {data:s}=useMaintenanceStatusQuery(); const total=s?Object.values(s).reduce((a,b)=>a+b,0):0
  const m=[{l:"Students",v:s?.students??0,icon:Users,c:"text-blue-600 dark:text-blue-400"},{l:"Batches",v:s?.batches??0,icon:Database,c:"text-amber-600 dark:text-amber-400"},{l:"Attendance",v:s?.attendances??0,icon:Calendar,c:"text-emerald-600 dark:text-emerald-400"},{l:"Fee Receipts",v:s?.feeReceipts??0,icon:Receipt,c:"text-violet-600 dark:text-violet-400"},{l:"Lectures",v:s?.lectures??0,icon:BookOpen,c:"text-cyan-600 dark:text-cyan-400"},{l:"Tests",v:s?.tests??0,icon:ClipboardCheck,c:"text-pink-600 dark:text-pink-400"},{l:"Test Scores",v:s?.testScores??0,icon:CheckCircle2,c:"text-orange-600 dark:text-orange-400"},{l:"Notes",v:s?.notes??0,icon:FileText,c:"text-teal-600 dark:text-teal-400"}]
  return <div className="space-y-5"><div><h2 className="text-lg font-semibold">System Overview</h2><p className="text-sm text-muted-foreground">Seed data snapshot. Total: <strong>{total}</strong> records.</p></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{m.map(({l,v,icon:I,c})=><Card key={l} className="p-4"><div className="flex items-center gap-3"><div className={cn("p-2 rounded-lg bg-secondary shrink-0",c)}><I className="h-4 w-4"/></div><div><p className="text-xl font-bold tabular-nums">{v}</p><p className="text-[10px] text-muted-foreground font-medium">{l}</p></div></div></Card>)}</div>{total===0&&<Card className="p-6 text-center border-dashed"><Database className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2"/><p className="text-sm text-muted-foreground">No seed data. Use <strong>Seed Engine</strong> to create test data.</p></Card>}</div>
}

function SeedPanel({password}:{password:string}) {
  const {data:batches=[]}=useGetAllBatchesQuery()
  const {data:seedData,refetch:refetchSeedData}=useMaintenanceSeedDataQuery()
  const [seed,{isLoading}]=useMaintenanceSeedMutation()
  const {refetch:refetchStatus}=useMaintenanceStatusQuery()
  const [count,setCount]=useState(10); const [batchId,setBatchId]=useState(""); const [summary,setSummary]=useState<Record<string,number>|null>(null)
  const [copiedIdx,setCopiedIdx]=useState<number|null>(null)
  const cp=useCallback((email:string,pw:string,idx:number)=>{navigator.clipboard.writeText(`${email} / ${pw}`);setCopiedIdx(idx);setTimeout(()=>setCopiedIdx(null),2000)},[])

  const go=async()=>{try{const r=await seed({password,count,batchId:batchId&&batchId!=="auto"?parseInt(batchId):undefined}).unwrap();setSummary(r.data.summary);refetchStatus();refetchSeedData();toast.success(`Seeded ${r.data.summary.students} students with all data`)}catch(e:any){toast.error("Seed failed",{description:e.data?.message||e.message})}}

  return <div className="space-y-5">
    <div><h2 className="text-lg font-semibold">Seed Engine</h2><p className="text-sm text-muted-foreground">Creates students + batch with attendance, fees, test scores, lectures, notes. All tagged <code className="text-primary font-medium">[SEED]</code>.</p></div>
    <Card className="p-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Count</label><Input type="number" value={count} onChange={e=>setCount(Math.max(1,Math.min(500,parseInt(e.target.value)||1)))} min={1} max={500} className="h-10"/></div>
      <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Batch</label><Select value={batchId} onValueChange={setBatchId}><SelectTrigger className="h-10"><SelectValue placeholder="Auto-create new"/></SelectTrigger><SelectContent><SelectItem value="auto">Auto-create [SEED] Batch</SelectItem>{batches.map((b:any)=><SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex items-end"><Button onClick={go} disabled={isLoading} className="w-full h-10">{isLoading?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:<Zap className="h-4 w-4 mr-2"/>}{isLoading?"Seeding...":`Seed ${count} Students`}</Button></div>
    </div></Card>
    {summary&&<StatCards items={[{label:"Students",value:summary.students},{label:"Attendance",value:summary.attendances},{label:"Fee Receipts",value:summary.feeReceipts},{label:"Tests",value:summary.tests},{label:"Scores",value:summary.testScores},{label:"Lectures",value:summary.lectures},{label:"Notes",value:summary.notes},{label:"Batches",value:summary.batches}]}/>}

    {/* Persistent seed batches */}
    {seedData&&seedData.batches.length>0&&<Card className="overflow-hidden"><div className="px-4 py-2.5 border-b bg-secondary/30 flex items-center justify-between"><span className="text-sm font-medium">Seed Batches</span><Badge variant="secondary" className="text-[10px]">{seedData.batches.length}</Badge></div><div className="max-h-[200px] overflow-y-auto"><table className="w-full text-xs"><thead><tr className="border-b"><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">ID</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Name</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Students</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Lectures</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Tests</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Notes</th></tr></thead><tbody>{seedData.batches.map(b=><tr key={b.id} className="border-b border-border/50 hover:bg-secondary/20"><td className="px-3 py-1.5 text-muted-foreground">#{b.id}</td><td className="px-3 py-1.5 font-medium">{b.name.replace("[SEED] ","")}</td><td className="px-3 py-1.5">{b._count.students}</td><td className="px-3 py-1.5">{b._count.lectures}</td><td className="px-3 py-1.5">{b._count.tests}</td><td className="px-3 py-1.5">{b._count.notes}</td></tr>)}</tbody></table></div></Card>}

    {/* Persistent seed students */}
    {seedData&&seedData.students.length>0&&<Card className="overflow-hidden"><div className="px-4 py-2.5 border-b bg-secondary/30 flex items-center justify-between"><span className="text-sm font-medium">Seed Students</span><Badge variant="secondary" className="text-[10px]">{seedData.students.length} accounts · password: seed123</Badge></div><div className="max-h-[300px] overflow-y-auto"><table className="w-full text-xs"><thead><tr className="border-b"><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">ID</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Name</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Email</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Batch</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Att</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Fees</th><th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Scores</th><th className="px-3 py-2 w-8"></th></tr></thead><tbody>{seedData.students.map((s,i)=><tr key={s.id} className="border-b border-border/50 hover:bg-secondary/20"><td className="px-3 py-1.5 text-muted-foreground">#{s.id}</td><td className="px-3 py-1.5 font-medium">{s.firstname} {s.lastname}</td><td className="px-3 py-1.5 text-muted-foreground">{s.email}</td><td className="px-3 py-1.5 text-muted-foreground truncate max-w-[100px]">{s.batch?.name.replace("[SEED] ","")??"-"}</td><td className="px-3 py-1.5">{s._count.attendances}</td><td className="px-3 py-1.5">{s._count.feeReceipts}</td><td className="px-3 py-1.5">{s._count.testScores}</td><td className="px-3 py-1.5"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={()=>cp(s.email,"seed123",i)}>{copiedIdx===i?<Check className="h-3 w-3 text-emerald-500"/>:<Copy className="h-3 w-3"/>}</Button></td></tr>)}</tbody></table></div></Card>}
  </div>
}

function ApiHealthPanel({token}:{token:string}) {
  const [run,{isLoading}]=useMaintenanceApiHealthMutation(); const [r,setR]=useState<HealthResult|null>(null)
  const go=async()=>{try{const base=process.env.NEXT_PUBLIC_API_URL?.replace("/api","")||"http://localhost:8000";const res=await run({baseUrl:base,token}).unwrap();setR(res.data);toast.success(`${res.data.passed}/${res.data.total} healthy`)}catch{toast.error("Failed")}}
  return <div className="space-y-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">API Health Check</h2><p className="text-sm text-muted-foreground">Tests every GET endpoint for status and response time.</p></div><Button onClick={go} disabled={isLoading} size="sm">{isLoading?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:<Activity className="h-4 w-4 mr-2"/>}{isLoading?"Running...":"Run Check"}</Button></div>
  {r&&<><StatCards items={[{label:"Total",value:r.total},{label:"Passed",value:r.passed,color:"text-emerald-600 dark:text-emerald-400"},{label:"Failed",value:r.failed,color:r.failed>0?"text-red-600 dark:text-red-400":undefined}]}/><Card className="overflow-hidden"><div className="max-h-[400px] overflow-y-auto"><table className="w-full text-xs"><thead className="sticky top-0 bg-background"><tr className="border-b bg-secondary/30"><th className="text-left px-3 py-2 font-medium text-muted-foreground">Method</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Endpoint</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Module</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Time</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Result</th></tr></thead><tbody>{r.results.map((x,i)=><tr key={i} className={cn("border-b border-border/50",!x.passed&&"bg-red-500/5")}><td className="px-3 py-1.5"><Badge variant="outline" className="text-[9px]">{x.method}</Badge></td><td className="px-3 py-1.5 text-muted-foreground">{x.path}</td><td className="px-3 py-1.5 font-medium">{x.module}</td><td className="px-3 py-1.5 tabular-nums">{x.status}</td><td className="px-3 py-1.5"><TimeBadge ms={x.time}/></td><td className="px-3 py-1.5"><StatusBadge passed={x.passed}/></td></tr>)}</tbody></table></div></Card></>}</div>
}

function ValidationPanel({token}:{token:string}) {
  const [run,{isLoading}]=useMaintenanceValidationMutation(); const [r,setR]=useState<ValidationResult|null>(null)
  const go=async()=>{try{const base=process.env.NEXT_PUBLIC_API_URL?.replace("/api","")||"http://localhost:8000";const res=await run({baseUrl:base,token}).unwrap();setR(res.data);toast.success(`${res.data.passed}/${res.data.total} validations enforced`)}catch{toast.error("Failed")}}
  return <div className="space-y-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Validation Audit</h2><p className="text-sm text-muted-foreground">Sends invalid payloads to every POST endpoint. Expects 400 rejection.</p></div><Button onClick={go} disabled={isLoading} size="sm">{isLoading?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:<CheckCircle2 className="h-4 w-4 mr-2"/>}{isLoading?"Auditing...":"Run Audit"}</Button></div>
  {r&&<><StatCards items={[{label:"Tests",value:r.total},{label:"Rejected (Good)",value:r.passed,color:"text-emerald-600 dark:text-emerald-400"},{label:"Leaked (Bad)",value:r.failed,color:r.failed>0?"text-red-600 dark:text-red-400":undefined}]}/><Card className="overflow-hidden"><div className="max-h-[400px] overflow-y-auto"><table className="w-full text-xs"><thead className="sticky top-0 bg-background"><tr className="border-b bg-secondary/30"><th className="text-left px-3 py-2 font-medium text-muted-foreground">Module</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Test Case</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Server Error</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Result</th></tr></thead><tbody>{r.results.map((x,i)=><tr key={i} className={cn("border-b border-border/50",!x.passed&&"bg-red-500/5")}><td className="px-3 py-1.5 font-medium">{x.module}</td><td className="px-3 py-1.5 text-muted-foreground">{x.desc}</td><td className="px-3 py-1.5 tabular-nums">{x.status}</td><td className="px-3 py-1.5 text-muted-foreground max-w-[180px] truncate">{x.serverMessage||"—"}</td><td className="px-3 py-1.5"><StatusBadge passed={x.passed}/></td></tr>)}</tbody></table></div></Card></>}</div>
}

function SecurityPanel({token}:{token:string}) {
  const [run,{isLoading}]=useMaintenanceSecurityMutation(); const [r,setR]=useState<SecurityResult|null>(null)
  const go=async()=>{try{const base=process.env.NEXT_PUBLIC_API_URL?.replace("/api","")||"http://localhost:8000";const res=await run({baseUrl:base,token}).unwrap();setR(res.data);toast.success(`${res.data.passed}/${res.data.total} secure`)}catch{toast.error("Failed")}}
  return <div className="space-y-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Security Audit</h2><p className="text-sm text-muted-foreground">Tests no-auth, fake-token, and admin-only route verification.</p></div><Button onClick={go} disabled={isLoading} size="sm">{isLoading?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:<Shield className="h-4 w-4 mr-2"/>}{isLoading?"Scanning...":"Run Audit"}</Button></div>
  {r&&<><StatCards items={[{label:"Tests",value:r.total},{label:"Secure",value:r.passed,color:"text-emerald-600 dark:text-emerald-400"},{label:"Vulnerable",value:r.failed,color:r.failed>0?"text-red-600 dark:text-red-400":undefined}]}/><Card className="overflow-hidden"><div className="max-h-[400px] overflow-y-auto"><table className="w-full text-xs"><thead className="sticky top-0 bg-background"><tr className="border-b bg-secondary/30"><th className="text-left px-3 py-2 font-medium text-muted-foreground">Test</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Module</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Endpoint</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Got</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Expected</th><th className="text-left px-3 py-2 font-medium text-muted-foreground">Result</th></tr></thead><tbody>{r.results.map((x,i)=><tr key={i} className={cn("border-b border-border/50",!x.passed&&"bg-red-500/5")}><td className="px-3 py-1.5"><Badge variant="outline" className="text-[9px]">{x.test}</Badge></td><td className="px-3 py-1.5 font-medium">{x.module}</td><td className="px-3 py-1.5 text-muted-foreground">{x.path}</td><td className="px-3 py-1.5 tabular-nums">{x.status}</td><td className="px-3 py-1.5 text-muted-foreground">{x.expected}</td><td className="px-3 py-1.5"><StatusBadge passed={x.passed}/></td></tr>)}</tbody></table></div></Card></>}</div>
}

function DbIntegrityPanel() {
  const {data:r,isLoading,refetch}=useMaintenanceDbIntegrityQuery()
  return <div className="space-y-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Database Integrity</h2><p className="text-sm text-muted-foreground">Orphan records, broken FKs, duplicate data checks.</p></div><Button onClick={()=>refetch()} disabled={isLoading} size="sm">{isLoading?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:<Database className="h-4 w-4 mr-2"/>}{isLoading?"Checking...":"Run Check"}</Button></div>
  {r&&<><StatCards items={[{label:"Checks",value:r.total},{label:"Issues",value:r.issues,color:r.issues>0?"text-red-600 dark:text-red-400":"text-emerald-600 dark:text-emerald-400"}]}/><div className="space-y-2">{r.checks.map((c,i)=><Card key={i} className={cn("p-3 flex items-center justify-between gap-4",!c.passed&&"border-red-500/30 bg-red-500/5")}><div className="min-w-0"><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground mt-0.5">{c.detail}</p></div><div className="flex items-center gap-2 shrink-0">{c.count>0&&<Badge variant="secondary" className="tabular-nums text-[10px]">{c.count}</Badge>}<StatusBadge passed={c.passed}/></div></Card>)}</div></>}</div>
}

function LoadTestPanel({token}:{token:string}) {
  const {data:eps=[]}=useMaintenanceEndpointsQuery(); const [run,{isLoading}]=useMaintenanceLoadTestMutation()
  const [ep,setEp]=useState(""); const [con,setCon]=useState(5); const [iter,setIter]=useState(50); const [r,setR]=useState<LoadTestResult|null>(null)
  const go=async()=>{if(!ep){toast.error("Select endpoint");return};try{const base=process.env.NEXT_PUBLIC_API_URL?.replace("/api","")||"http://localhost:8000";const res=await run({baseUrl:base,token,endpoint:ep,concurrency:con,iterations:iter}).unwrap();setR(res.data);toast.success(`${res.data.requestsPerSecond} req/s`)}catch{toast.error("Failed")}}
  return <div className="space-y-5"><div><h2 className="text-lg font-semibold">Load Test</h2><p className="text-sm text-muted-foreground">Concurrent requests to measure throughput and latency.</p></div>
  <Card className="p-4"><div className="grid grid-cols-1 md:grid-cols-4 gap-3"><div className="md:col-span-2 space-y-1"><label className="text-xs font-medium text-muted-foreground">Endpoint</label><Select value={ep} onValueChange={setEp}><SelectTrigger className="h-10"><SelectValue placeholder="Select"/></SelectTrigger><SelectContent>{eps.filter(e=>e.method==="GET").map(e=><SelectItem key={e.path} value={e.path}>{e.module} — {e.path}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Concurrency</label><Input type="number" value={con} onChange={e=>setCon(Math.max(1,Math.min(20,parseInt(e.target.value)||1)))} className="h-10"/></div><div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Iterations</label><Input type="number" value={iter} onChange={e=>setIter(Math.max(1,Math.min(200,parseInt(e.target.value)||1)))} className="h-10"/></div></div><Button onClick={go} disabled={isLoading} className="mt-3" size="sm">{isLoading?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:<Timer className="h-4 w-4 mr-2"/>}{isLoading?"Testing...":"Run"}</Button></Card>
  {r&&<StatCards items={[{label:"Requests",value:r.totalRequests},{label:"Req/s",value:r.requestsPerSecond,color:"text-emerald-600 dark:text-emerald-400"},{label:"Avg",value:`${r.avgTime}ms`},{label:"p95",value:`${r.p95Time}ms`,color:r.p95Time>500?"text-red-600 dark:text-red-400":"text-emerald-600 dark:text-emerald-400"},{label:"Min",value:`${r.minTime}ms`},{label:"Max",value:`${r.maxTime}ms`},{label:"OK",value:r.successful,color:"text-emerald-600 dark:text-emerald-400"},{label:"Fail",value:r.failed,color:r.failed>0?"text-red-600 dark:text-red-400":undefined}]}/>}</div>
}

function PlaygroundPanel({token}:{token:string}) {
  const {data:eps=[]}=useMaintenanceEndpointsQuery(); const [run,{isLoading}]=useMaintenancePlaygroundMutation()
  const [ep,setEp]=useState(""); const [method,setMethod]=useState("GET"); const [body,setBody]=useState(""); const [r,setR]=useState<PlaygroundResult|null>(null)
  const go=async()=>{if(!ep){toast.error("Select endpoint");return};try{const base=process.env.NEXT_PUBLIC_API_URL?.replace("/api","")||"http://localhost:8000";let parsed:any=undefined;if(body.trim()){try{parsed=JSON.parse(body)}catch{toast.error("Invalid JSON body");return}};const res=await run({baseUrl:base,token,endpoint:ep,method,body:parsed}).unwrap();setR(res.data);toast.success(`${res.data.response.status} in ${res.data.response.time}ms`)}catch{toast.error("Request failed")}}
  const statusColor=(s:number)=>s>=200&&s<300?"text-emerald-600 dark:text-emerald-400":s>=400?"text-red-600 dark:text-red-400":"text-amber-600 dark:text-amber-400"

  return <div className="space-y-5"><div><h2 className="text-lg font-semibold">API Playground</h2><p className="text-sm text-muted-foreground">Postman-like interface. Send any request, see full request + response with headers.</p></div>
  <Card className="p-4 space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
      <div className="md:col-span-2 space-y-1"><label className="text-xs font-medium text-muted-foreground">Method</label><Select value={method} onValueChange={setMethod}><SelectTrigger className="h-10"><SelectValue/></SelectTrigger><SelectContent>{["GET","POST","PUT","PATCH","DELETE"].map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
      <div className="md:col-span-8 space-y-1"><label className="text-xs font-medium text-muted-foreground">Endpoint</label><Select value={ep} onValueChange={setEp}><SelectTrigger className="h-10"><SelectValue placeholder="Select endpoint"/></SelectTrigger><SelectContent>{eps.map(e=><SelectItem key={`${e.method}-${e.path}`} value={e.path}><span className="text-muted-foreground mr-1">{e.module}</span>{e.path}</SelectItem>)}</SelectContent></Select></div>
      <div className="md:col-span-2 flex items-end"><Button onClick={go} disabled={isLoading} className="w-full h-10">{isLoading?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}</Button></div>
    </div>
    {method!=="GET"&&<div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">Request Body (JSON)</label><textarea value={body} onChange={e=>setBody(e.target.value)} className="w-full h-24 px-3 py-2 rounded-lg border border-input bg-background text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder='{"key": "value"}'/></div>}
  </Card>

  {r&&<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Request */}
    <Card className="overflow-hidden"><div className="px-4 py-2 border-b bg-secondary/30 flex items-center justify-between"><span className="text-xs font-semibold">REQUEST</span><Badge variant="outline" className="text-[9px]">{r.request.method}</Badge></div><div className="p-3 space-y-2"><p className="text-xs text-muted-foreground break-all">{r.request.url}</p>{r.request.body&&<div><p className="text-[10px] font-medium text-muted-foreground mb-1">Body</p><pre className="text-[11px] font-mono bg-secondary/50 rounded-lg p-2.5 overflow-auto max-h-[200px] text-foreground">{JSON.stringify(r.request.body,null,2)}</pre></div>}</div></Card>
    {/* Response */}
    <Card className="overflow-hidden"><div className="px-4 py-2 border-b bg-secondary/30 flex items-center justify-between"><span className="text-xs font-semibold">RESPONSE</span><div className="flex items-center gap-2"><span className={cn("text-sm font-bold tabular-nums",statusColor(r.response.status))}>{r.response.status}</span><TimeBadge ms={r.response.time}/></div></div><div className="p-3"><pre className="text-[11px] font-mono bg-secondary/50 rounded-lg p-2.5 overflow-auto max-h-[300px] text-foreground whitespace-pre-wrap">{JSON.stringify(r.response.body,null,2)}</pre></div></Card>
  </div>}
  </div>
}

function CleanupPanel({password}:{password:string}) {
  const {data:s,refetch}=useMaintenanceStatusQuery(); const {refetch:refetchSeedData}=useMaintenanceSeedDataQuery()
  const [cleanup,{isLoading}]=useMaintenanceCleanupMutation(); const total=s?Object.values(s).reduce((a,b)=>a+b,0):0
  const go=async()=>{try{const r=await cleanup({password}).unwrap();const d=Object.values(r.data).reduce((a:number,b:number)=>a+b,0);refetch();refetchSeedData();toast.success(`Purged ${d} records`)}catch{toast.error("Failed")}}
  return <div className="space-y-5"><div><h2 className="text-lg font-semibold">Cleanup</h2><p className="text-sm text-muted-foreground">Delete all <code className="text-primary font-medium">[SEED]</code> data. Real data is never touched.</p></div>
  {total===0?<Card className="p-6 text-center border-dashed"><Trash2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2"/><p className="text-sm text-muted-foreground">No seed data to clean.</p></Card>:
  <Card className="p-4 border-destructive/30"><div className="flex items-start gap-3 mb-4"><AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5"/><div><p className="text-sm font-medium">Destructive Action</p><p className="text-xs text-muted-foreground mt-0.5">Permanently delete <strong>{total}</strong> seed records.</p></div></div><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" disabled={isLoading} size="sm">{isLoading?<Loader2 className="h-4 w-4 animate-spin mr-2"/>:<Trash2 className="h-4 w-4 mr-2"/>}Delete All ({total})</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirm Cleanup</AlertDialogTitle><AlertDialogDescription>Delete {total} seed records permanently.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={go} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></Card>}</div>
}

export default function MaintenancePage() {
  const {user,token:authToken}=useAppSelector(s=>s.auth); const router=useRouter()
  const [unlocked,setUnlocked]=useState(false); const [password,setPassword]=useState(""); const [active,setActive]=useState<Panel>("overview")
  if(user?.role!=="ADMIN") return <div className="min-h-[60vh] flex items-center justify-center"><div className="text-center space-y-3"><Shield className="h-12 w-12 text-muted-foreground mx-auto"/><h1 className="text-xl font-bold">Access Restricted</h1><p className="text-sm text-muted-foreground">Admin only.</p><Button variant="outline" size="sm" onClick={()=>router.push("/settings")}>← Settings</Button></div></div>
  if(!unlocked) return <PasswordGate onUnlock={pw=>{setPassword(pw);setUnlocked(true)}}/>
  const groups=[...new Set(NAV.map(n=>n.group))]
  return <div className="flex gap-6">
    <aside className="w-[200px] shrink-0 space-y-4 sticky top-24 self-start">
      <button onClick={()=>router.push("/settings")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1"><ArrowLeft className="h-3 w-3"/>Settings</button>
      <p className="text-sm font-bold">QA Center</p>
      {groups.map(g=><div key={g}><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">{g}</p><div className="space-y-0.5">{NAV.filter(n=>n.group===g).map(n=>{const a=active===n.id;return<button key={n.id} onClick={()=>setActive(n.id)} className={cn("w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all",a?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-foreground hover:bg-secondary")}><n.icon className="h-3.5 w-3.5 shrink-0"/><span>{n.label}</span></button>})}</div></div>)}
    </aside>
    <div className="flex-1 min-w-0">
      {active==="overview"&&<OverviewPanel/>}
      {active==="seed"&&<SeedPanel password={password}/>}
      {active==="api-health"&&<ApiHealthPanel token={authToken||""}/>}
      {active==="validation"&&<ValidationPanel token={authToken||""}/>}
      {active==="security"&&<SecurityPanel token={authToken||""}/>}
      {active==="db-integrity"&&<DbIntegrityPanel/>}
      {active==="load-test"&&<LoadTestPanel token={authToken||""}/>}
      {active==="playground"&&<PlaygroundPanel token={authToken||""}/>}
      {active==="cleanup"&&<CleanupPanel password={password}/>}
    </div>
  </div>
}
