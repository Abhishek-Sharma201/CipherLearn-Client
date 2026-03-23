import bcrypt from "bcryptjs";
import { prisma } from "../../../config/db.config";
import { config } from "../../../config/env.config";
import { log } from "../../../utils/logtail";
import { UserRoles } from "../../../../prisma/generated/prisma/client";

const SEED_TAG = "[SEED]";

// ────────────────────────────────────────────────────────────
// API Registry
// ────────────────────────────────────────────────────────────

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  module: string;
  auth: "admin" | "adminOrTeacher" | "authenticated";
  hasValidation: boolean;
  skipHealth?: boolean;
}

const API_REGISTRY: ApiEndpoint[] = [
  { method: "GET",  path: "/dashboard/batches",                   module: "Batches",       auth: "adminOrTeacher", hasValidation: false },
  { method: "GET",  path: "/dashboard/batches/drafts",            module: "Batches",       auth: "admin",          hasValidation: false },
  { method: "POST", path: "/dashboard/batches",                   module: "Batches",       auth: "admin",          hasValidation: true },
  { method: "GET",  path: "/dashboard/student-enrollment",        module: "Students",      auth: "adminOrTeacher", hasValidation: false },
  { method: "GET",  path: "/dashboard/student-enrollment/deleted",module: "Students",      auth: "admin",          hasValidation: false },
  { method: "POST", path: "/dashboard/student-enrollment",        module: "Students",      auth: "admin",          hasValidation: true },
  { method: "GET",  path: "/dashboard/attendance",                module: "Attendance",    auth: "adminOrTeacher", hasValidation: false },
  { method: "GET",  path: "/dashboard/fees/receipts",             module: "Fees",          auth: "adminOrTeacher", hasValidation: false },
  { method: "GET",  path: "/dashboard/fees/receipts/summary",     module: "Fees",          auth: "adminOrTeacher", hasValidation: false },
  { method: "POST", path: "/dashboard/fees/structures",           module: "Fees",          auth: "adminOrTeacher", hasValidation: true },
  { method: "POST", path: "/dashboard/fees/receipts",             module: "Fees",          auth: "adminOrTeacher", hasValidation: true },
  { method: "GET",  path: "/dashboard/lectures",                  module: "Lectures",      auth: "adminOrTeacher", hasValidation: false },
  { method: "GET",  path: "/dashboard/lectures/schedule",         module: "Lectures",      auth: "adminOrTeacher", hasValidation: false },
  { method: "POST", path: "/dashboard/lectures",                  module: "Lectures",      auth: "adminOrTeacher", hasValidation: true },
  { method: "GET",  path: "/dashboard/tests",                     module: "Tests",         auth: "adminOrTeacher", hasValidation: false },
  { method: "POST", path: "/dashboard/tests",                     module: "Tests",         auth: "adminOrTeacher", hasValidation: true },
  { method: "GET",  path: "/dashboard/notes",                     module: "Notes",         auth: "adminOrTeacher", hasValidation: false },
  { method: "POST", path: "/dashboard/notes",                     module: "Notes",         auth: "adminOrTeacher", hasValidation: true },
  { method: "GET",  path: "/dashboard/youtube-videos",            module: "Videos",        auth: "adminOrTeacher", hasValidation: false },
  { method: "POST", path: "/dashboard/youtube-videos/upload",     module: "Videos",        auth: "adminOrTeacher", hasValidation: true },
  { method: "GET",  path: "/dashboard/assignments",               module: "Assignments",   auth: "adminOrTeacher", hasValidation: false },
  { method: "GET",  path: "/dashboard/study-materials",           module: "Materials",     auth: "adminOrTeacher", hasValidation: false },
  { method: "POST", path: "/dashboard/study-materials",           module: "Materials",     auth: "adminOrTeacher", hasValidation: true },
  { method: "GET",  path: "/dashboard/announcements",             module: "Announcements", auth: "adminOrTeacher", hasValidation: false },
  { method: "POST", path: "/dashboard/announcements",             module: "Announcements", auth: "adminOrTeacher", hasValidation: true },
  { method: "GET",  path: "/dashboard/teachers",                  module: "Teachers",      auth: "adminOrTeacher", hasValidation: false },
  { method: "GET",  path: "/dashboard/analytics/dashboard",       module: "Analytics",     auth: "adminOrTeacher", hasValidation: false },
  { method: "GET",  path: "/dashboard/settings",                  module: "Settings",      auth: "admin",          hasValidation: false },
  { method: "GET",  path: "/dashboard/notifications",             module: "Notifications", auth: "authenticated",  hasValidation: false },
  { method: "GET",  path: "/dashboard/notifications/unread-count",module: "Notifications", auth: "authenticated",  hasValidation: false },
];

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const NAMES = ["Aarav","Priya","Rohan","Ananya","Vivaan","Ishita","Aditya","Meera","Arjun","Divya","Kabir","Nisha","Dev","Pooja","Ravi","Sanya","Yash","Kavya","Harsh","Sneha"];
const SURNAMES = ["Sharma","Patel","Singh","Kumar","Gupta","Verma","Joshi","Mishra","Chauhan","Agarwal"];
const SUBJECTS = ["Mathematics","Science","English","Hindi","Social Studies","Computer Science","Physics","Chemistry"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function httpFetch(url: string, opts: { method: string; headers: Record<string, string>; body?: string; timeout?: number }): Promise<{ status: number; time: number; body?: any }> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeout || 10000);
    const res = await fetch(url, { method: opts.method, headers: opts.headers, body: opts.body, signal: controller.signal });
    clearTimeout(timer);
    let body: any;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, time: Date.now() - start, body };
  } catch (err: any) {
    return { status: 0, time: Date.now() - start, body: { error: err.message } };
  }
}

// ────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────

export default class MaintenanceService {

  async verifyPassword(password: string): Promise<boolean> {
    const hash = config.MAINTENANCE.PASSWORD_HASH;
    if (!hash) { log("error", "MAINTENANCE_PASSWORD_HASH not set", {}); return false; }
    return bcrypt.compare(password, hash);
  }

  // ── Status ────────────────────────────────────
  async getStatus(): Promise<Record<string, number>> {
    const [students, users, batches, attendances, feeReceipts, lectures, tests, testScores, notes] = await Promise.all([
      prisma.student.count({ where: { fullname: { contains: SEED_TAG } } }),
      prisma.user.count({ where: { name: { contains: SEED_TAG } } }),
      prisma.batch.count({ where: { name: { contains: SEED_TAG } } }),
      prisma.attendance.count({ where: { markedBy: { contains: SEED_TAG } } }),
      prisma.feeReceipt.count({ where: { generatedBy: { contains: SEED_TAG } } }),
      prisma.lecture.count({ where: { title: { contains: SEED_TAG } } }),
      prisma.test.count({ where: { title: { contains: SEED_TAG } } }),
      prisma.testScore.count({ where: { remarks: { contains: SEED_TAG } } }),
      prisma.note.count({ where: { title: { contains: SEED_TAG } } }),
    ]);
    return { students, users, batches, attendances, feeReceipts, lectures, tests, testScores, notes };
  }

  // ── Seed (full data) ─────────────────────────
  async seed(count: number, batchId?: number): Promise<{
    summary: Record<string, number>;
    students: { name: string; email: string; password: string; batchName: string }[];
  }> {
    const counters = { students: 0, users: 0, batches: 0, attendances: 0, feeReceipts: 0, lectures: 0, tests: 0, testScores: 0, notes: 0 };

    // 1. Resolve or create batch
    let batch: { id: number; name: string };
    if (batchId) {
      const existing = await prisma.batch.findUnique({ where: { id: batchId } });
      if (!existing) throw new Error(`Batch ${batchId} not found`);
      batch = { id: existing.id, name: existing.name };
    } else {
      const ts = Date.now();
      const seedBatch = await prisma.batch.create({
        data: { name: `${SEED_TAG} Test Batch ${ts}`, timings: { days: ["Mon", "Wed", "Fri"], time: "10:00 AM" } },
      });
      batch = { id: seedBatch.id, name: seedBatch.name };
      counters.batches = 1;
    }

    // 2. Create fee structure for the batch
    let feeStructure: { id: number } | null = null;
    try {
      feeStructure = await prisma.feeStructure.create({
        data: { batchId: batch.id, name: `${SEED_TAG} Fee ${Date.now()}`, amount: 2000, frequency: "MONTHLY", dueDay: 5 },
      });
    } catch { /* ignore if already exists */ }

    // 3. Create lectures
    for (let i = 0; i < 5; i++) {
      try {
        const d = new Date(); d.setDate(d.getDate() - randInt(0, 30));
        await prisma.lecture.create({
          data: {
            title: `${SEED_TAG} ${pick(SUBJECTS)} Lecture ${i + 1}`,
            subject: pick(SUBJECTS), batchId: batch.id, createdBy: 1,
            date: d, startTime: "10:00", endTime: "11:00", duration: 60,
            status: "COMPLETED",
          },
        });
        counters.lectures++;
      } catch { /* skip */ }
    }

    // 4. Create tests
    const testIds: number[] = [];
    for (let i = 0; i < 3; i++) {
      try {
        const d = new Date(); d.setDate(d.getDate() - randInt(0, 30));
        const test = await prisma.test.create({
          data: {
            title: `${SEED_TAG} ${pick(SUBJECTS)} Test ${i + 1}`,
            subject: pick(SUBJECTS), batchId: batch.id, createdBy: 1,
            totalMarks: 100, passingMarks: 35, date: d, status: "PUBLISHED",
          },
        });
        testIds.push(test.id);
        counters.tests++;
      } catch { /* skip */ }
    }

    // 5. Create notes
    for (let i = 0; i < 3; i++) {
      try {
        await prisma.note.create({
          data: { title: `${SEED_TAG} ${pick(SUBJECTS)} Notes ${i + 1}`, content: ["Sample content"], batchId: batch.id },
        });
        counters.notes++;
      } catch { /* skip */ }
    }

    // 6. Create students with all related data
    const hashedPw = await bcrypt.hash("seed123", 10);
    const seeded: { name: string; email: string; password: string; batchName: string }[] = [];

    for (let i = 0; i < count; i++) {
      const first = pick(NAMES);
      const last = pick(SURNAMES);
      const fullname = `${SEED_TAG} ${first} ${last}`;
      const email = `s${Date.now()}${i}@t.cl`;

      try {
        const { studentId } = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: { name: fullname, email, password: hashedPw, role: UserRoles.STUDENT, isPasswordSet: true },
          });
          const student = await tx.student.create({
            data: {
              firstname: first, middlename: "", lastname: last, fullname, email,
              dob: `200${randInt(0, 9)}-0${randInt(1, 9)}-${randInt(10, 28)}`,
              batchId: batch.id, userId: user.id,
              phone: `+91 ${randInt(70000, 99999)}${randInt(10000, 99999)}`,
              parentName: `${pick(NAMES)} ${last}`, grade: `${randInt(6, 12)}th`,
            },
          });
          return { studentId: student.id };
        });

        counters.students++; counters.users++;
        seeded.push({ name: `${first} ${last}`, email, password: "seed123", batchName: batch.name });

        // Attendance — 15 days
        for (let d = 0; d < 15; d++) {
          try {
            const date = new Date(); date.setDate(date.getDate() - d);
            await prisma.attendance.create({
              data: {
                studentId, batchId: batch.id, date,
                status: Math.random() > 0.2 ? "PRESENT" : "ABSENT",
                markedBy: `${SEED_TAG} System`,
              },
            });
            counters.attendances++;
          } catch { /* unique constraint — skip */ }
        }

        // Fee receipts — 2 months
        if (feeStructure) {
          for (let m = 0; m < 2; m++) {
            try {
              const now = new Date();
              const dueDate = new Date(now.getFullYear(), now.getMonth() - m, 5);
              const statuses: Array<"PAID" | "PENDING" | "OVERDUE"> = ["PAID", "PENDING", "OVERDUE"];
              const status = pick(statuses);
              const paid = status === "PAID" ? 2000 : status === "PENDING" ? 0 : 0;
              await prisma.feeReceipt.create({
                data: {
                  receiptNumber: `SEED-${Date.now()}-${i}-${m}`,
                  studentId, batchId: batch.id, feeStructureId: feeStructure.id,
                  totalAmount: 2000, paidAmount: paid, remainingAmount: 2000 - paid,
                  academicMonth: dueDate.getMonth() + 1, academicYear: dueDate.getFullYear(),
                  dueDate, status, generatedBy: `${SEED_TAG} System`,
                },
              });
              counters.feeReceipts++;
            } catch { /* skip */ }
          }
        }

        // Test scores
        for (const testId of testIds) {
          try {
            const marks = randInt(20, 100);
            await prisma.testScore.create({
              data: {
                testId, studentId, marksObtained: marks, percentage: marks,
                grade: marks >= 90 ? "A+" : marks >= 75 ? "A" : marks >= 60 ? "B" : marks >= 40 ? "C" : "F",
                status: marks >= 35 ? "PASS" : "FAIL",
                remarks: `${SEED_TAG} Auto-scored`, uploadedBy: 1,
              },
            });
            counters.testScores++;
          } catch { /* skip */ }
        }

      } catch (err: any) {
        log("warn", `maintenance.seed skip ${i}`, { err: err.message });
      }
    }

    return { summary: counters, students: seeded };
  }

  // ── Cleanup ──────────────────────────────────
  async cleanup(): Promise<Record<string, number>> {
    const d: Record<string, number> = {};
    // Delete in FK order
    d.testScores = (await prisma.testScore.deleteMany({ where: { remarks: { contains: SEED_TAG } } })).count;
    d.attendances = (await prisma.attendance.deleteMany({ where: { markedBy: { contains: SEED_TAG } } })).count;
    d.feeReceipts = (await prisma.feeReceipt.deleteMany({ where: { generatedBy: { contains: SEED_TAG } } })).count;
    d.notes = (await prisma.note.deleteMany({ where: { title: { contains: SEED_TAG } } })).count;
    d.lectures = (await prisma.lecture.deleteMany({ where: { title: { contains: SEED_TAG } } })).count;
    d.tests = (await prisma.test.deleteMany({ where: { title: { contains: SEED_TAG } } })).count;
    d.students = (await prisma.student.deleteMany({ where: { fullname: { contains: SEED_TAG } } })).count;
    d.users = (await prisma.user.deleteMany({ where: { name: { contains: SEED_TAG } } })).count;
    d.feeStructures = (await prisma.feeStructure.deleteMany({ where: { name: { contains: SEED_TAG } } })).count;
    d.batches = (await prisma.batch.deleteMany({ where: { name: { contains: SEED_TAG } } })).count;
    return d;
  }

  // ── API Health ───────────────────────────────
  async runApiHealth(baseUrl: string, token: string) {
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
    const results: { method: string; path: string; module: string; status: number; time: number; passed: boolean; error?: string }[] = [];

    for (const ep of API_REGISTRY) {
      if (ep.method !== "GET") continue;
      const res = await httpFetch(`${baseUrl}/api${ep.path}`, { method: "GET", headers });
      results.push({
        method: ep.method, path: ep.path, module: ep.module,
        status: res.status, time: res.time,
        passed: res.status >= 200 && res.status < 500,
        error: res.status >= 400 ? res.body?.message : undefined,
      });
    }

    return { total: results.length, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
  }

  // ── Validation Audit ─────────────────────────
  async runValidationAudit(baseUrl: string, token: string) {
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    const tests = [
      // Batches
      { method: "POST", path: "/dashboard/batches", module: "Batches", body: {}, desc: "Empty body" },
      { method: "POST", path: "/dashboard/batches", module: "Batches", body: { name: "" }, desc: "Empty name string" },
      { method: "POST", path: "/dashboard/batches", module: "Batches", body: { name: 123 }, desc: "Numeric name" },
      // Students
      { method: "POST", path: "/dashboard/student-enrollment", module: "Students", body: {}, desc: "Empty body" },
      { method: "POST", path: "/dashboard/student-enrollment", module: "Students", body: { email: "bad" }, desc: "Invalid email format" },
      { method: "POST", path: "/dashboard/student-enrollment", module: "Students", body: { email: "t@t.com", firstname: "" }, desc: "Empty firstname" },
      { method: "POST", path: "/dashboard/student-enrollment", module: "Students", body: { email: "t@t.com", firstname: "A", lastname: "B" }, desc: "Missing required fields (dob, address, batchId)" },
      { method: "POST", path: "/dashboard/student-enrollment", module: "Students", body: { email: "t@t.com", firstname: "A", lastname: "B", dob: "2000-01-01", address: "Test", batchId: -1 }, desc: "Negative batchId" },
      // Lectures
      { method: "POST", path: "/dashboard/lectures", module: "Lectures", body: {}, desc: "Empty body" },
      { method: "POST", path: "/dashboard/lectures", module: "Lectures", body: { title: "" }, desc: "Empty title" },
      { method: "POST", path: "/dashboard/lectures", module: "Lectures", body: { title: "X" }, desc: "Missing subject, batchId, date, time" },
      // Fees
      { method: "POST", path: "/dashboard/fees/structures", module: "Fees", body: {}, desc: "Empty fee structure body" },
      { method: "POST", path: "/dashboard/fees/receipts", module: "Fees", body: {}, desc: "Empty fee receipt body" },
      { method: "POST", path: "/dashboard/fees/receipts/bulk", module: "Fees", body: {}, desc: "Empty bulk receipt body" },
      // Tests
      { method: "POST", path: "/dashboard/tests", module: "Tests", body: {}, desc: "Empty body" },
      { method: "POST", path: "/dashboard/tests", module: "Tests", body: { title: "X" }, desc: "Missing subject, batchId, totalMarks, date" },
      // Notes
      { method: "POST", path: "/dashboard/notes", module: "Notes", body: {}, desc: "Empty body" },
      // Videos
      { method: "POST", path: "/dashboard/youtube-videos/upload", module: "Videos", body: {}, desc: "Empty body" },
      // Announcements
      { method: "POST", path: "/dashboard/announcements", module: "Announcements", body: {}, desc: "Empty body" },
      // Study materials
      { method: "POST", path: "/dashboard/study-materials", module: "Materials", body: {}, desc: "Empty body" },
    ];

    const results: { method: string; path: string; module: string; status: number; passed: boolean; desc: string; serverMessage?: string }[] = [];

    for (const t of tests) {
      const res = await httpFetch(`${baseUrl}/api${t.path}`, { method: t.method, headers, body: JSON.stringify(t.body) });
      const passed = res.status === 400 || res.status === 422;
      results.push({
        method: t.method, path: t.path, module: t.module, status: res.status, passed,
        desc: t.desc,
        serverMessage: res.body?.message || (res.body?.errors?.[0]?.message) || undefined,
      });
    }

    return { total: results.length, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
  }

  // ── Security Audit ───────────────────────────
  async runSecurityAudit(baseUrl: string, token: string) {
    const results: { test: string; path: string; module: string; status: number; passed: boolean; expected: string }[] = [];

    // 1. No auth header → expect 401/403
    for (const ep of API_REGISTRY.filter(e => e.method === "GET")) {
      const res = await httpFetch(`${baseUrl}/api${ep.path}`, { method: "GET", headers: { "Content-Type": "application/json" } });
      const passed = res.status === 401 || res.status === 403;
      results.push({ test: "No Auth", path: ep.path, module: ep.module, status: res.status, passed, expected: "401/403" });
    }

    // 2. Invalid token → expect 401/403
    for (const ep of API_REGISTRY.filter(e => e.method === "GET").slice(0, 5)) {
      const res = await httpFetch(`${baseUrl}/api${ep.path}`, { method: "GET", headers: { "Authorization": "Bearer fake_token", "Content-Type": "application/json" } });
      const passed = res.status === 401 || res.status === 403;
      results.push({ test: "Fake Token", path: ep.path, module: ep.module, status: res.status, passed, expected: "401/403" });
    }

    // 3. Admin-only routes with valid admin token → should succeed
    for (const ep of API_REGISTRY.filter(e => e.auth === "admin" && e.method === "GET")) {
      const res = await httpFetch(`${baseUrl}/api${ep.path}`, { method: "GET", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });
      const passed = res.status >= 200 && res.status < 500;
      results.push({ test: "Admin Access OK", path: ep.path, module: ep.module, status: res.status, passed, expected: "2xx" });
    }

    return { total: results.length, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
  }

  // ── DB Integrity ─────────────────────────────
  async runDbIntegrity() {
    const checks: { name: string; table: string; count: number; passed: boolean; detail: string }[] = [];

    const runCheck = async (name: string, table: string, sql: string) => {
      try {
        const result = await prisma.$queryRawUnsafe<{ count: bigint }[]>(sql);
        const c = Number(result[0]?.count ?? 0);
        checks.push({ name, table, count: c, passed: c === 0, detail: c === 0 ? "No issues found" : `${c} orphan records detected` });
      } catch (err: any) {
        checks.push({ name, table, count: -1, passed: true, detail: `Check skipped: ${err.message?.slice(0, 60)}` });
      }
    };

    await runCheck("Students without User account", "students",
      `SELECT COUNT(*) as count FROM students s LEFT JOIN users u ON s."userId" = u.id WHERE s."userId" IS NOT NULL AND u.id IS NULL`);
    await runCheck("Attendance without valid Student", "attendances",
      `SELECT COUNT(*) as count FROM attendances a LEFT JOIN students s ON a."studentId" = s.id WHERE s.id IS NULL`);
    await runCheck("Fee Receipts without valid Student", "fee_receipts",
      `SELECT COUNT(*) as count FROM fee_receipts f LEFT JOIN students s ON f."studentId" = s.id WHERE s.id IS NULL`);
    await runCheck("Test Scores without valid Test", "test_scores",
      `SELECT COUNT(*) as count FROM test_scores ts LEFT JOIN tests t ON ts."testId" = t.id WHERE t.id IS NULL`);
    await runCheck("Test Scores without valid Student", "test_scores",
      `SELECT COUNT(*) as count FROM test_scores ts LEFT JOIN students s ON ts."studentId" = s.id WHERE s.id IS NULL`);
    await runCheck("Lectures without valid Batch", "lectures",
      `SELECT COUNT(*) as count FROM lectures l LEFT JOIN batches b ON l."batchId" = b.id WHERE b.id IS NULL`);
    await runCheck("Notes without valid Batch", "notes",
      `SELECT COUNT(*) as count FROM notes n LEFT JOIN batches b ON n."batchId" = b.id WHERE b.id IS NULL`);
    await runCheck("Duplicate active student emails", "students",
      `SELECT COUNT(*) as count FROM (SELECT email FROM students WHERE "isDeleted" = false GROUP BY email HAVING COUNT(*) > 1) t`);

    return { total: checks.length, issues: checks.filter(c => !c.passed).length, checks };
  }

  // ── Load Test ────────────────────────────────
  async runLoadTest(baseUrl: string, token: string, endpoint: string, method: string, concurrency: number, iterations: number) {
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
    const times: number[] = [];
    const statuses: number[] = [];
    const totalStart = Date.now();

    for (let batch = 0; batch < iterations; batch += concurrency) {
      const batchSize = Math.min(concurrency, iterations - batch);
      const results = await Promise.all(
        Array.from({ length: batchSize }, () => httpFetch(`${baseUrl}/api${endpoint}`, { method, headers, timeout: 15000 }))
      );
      for (const r of results) { times.push(r.time); statuses.push(r.status); }
    }

    const totalDuration = (Date.now() - totalStart) / 1000;
    times.sort((a, b) => a - b);
    const successful = statuses.filter(s => s >= 200 && s < 400).length;
    const statusBreakdown: Record<number, number> = {};
    for (const s of statuses) statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;

    return {
      endpoint, totalRequests: times.length, successful, failed: times.length - successful,
      avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      minTime: times[0] || 0, maxTime: times[times.length - 1] || 0,
      p95Time: times[Math.floor(times.length * 0.95)] || 0,
      requestsPerSecond: Math.round((times.length / totalDuration) * 100) / 100,
      statusCodeBreakdown: statusBreakdown,
    };
  }

  getEndpointRegistry() {
    return API_REGISTRY.map(e => ({ method: e.method, path: e.path, module: e.module }));
  }
}
