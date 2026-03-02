# CipherLearn — End-to-End Test Guide
> Realistic sample data for **Sunrise Science Academy**, Pune
> Base URL: `http://localhost:5000/api`
> Run in order — each step creates data the next step depends on.

---

## The Scenario

**Class:** Sunrise Science Academy
**Owner/Admin:** Deepak Joshi (deepak@sunriseacademy.in)
**2 batches, 1 teacher, 5 students** — enough to test every feature realistically.

### Cast of Characters

| Role | Name | Email | Password |
|------|------|-------|----------|
| Admin | Deepak Joshi | deepak@sunriseacademy.in | Admin@2026 |
| Teacher | Ravi Sharma | ravi.sharma@sunriseacademy.in | (set via app) |
| Student | Aarav Verma | aarav.verma@gmail.com | (set via app) |
| Student | Sneha Kulkarni | sneha.kulkarni@gmail.com | (set via app) |
| Student | Rohit Desai | rohit.desai@gmail.com | (set via app) |
| Student | Kavya Nair | kavya.nair@gmail.com | (set via app) |
| Student | Arjun Patil | arjun.patil@gmail.com | (set via app) |

### Batch Structure

| Batch | Students | Schedule |
|-------|----------|----------|
| 11th Science Morning | Aarav, Sneha | Mon/Wed/Fri 07:00–09:00 |
| 12th Science Evening | Rohit, Kavya, Arjun | Tue/Thu/Sat 17:00–19:00 |

---

## PHASE 1 — Admin Setup

### Step 1.1 — Set ADMIN_EMAILS env var (before server starts)
```
ADMIN_EMAILS=deepak@sunriseacademy.in
```

### Step 1.2 — Create Admin Account
```
POST /auth/signup
```
```json
{
  "name": "Deepak Joshi",
  "email": "deepak@sunriseacademy.in",
  "password": "Admin@2026"
}
```
**Expected:** `201` — Registration successful

---

### Step 1.3 — Admin Login
```
POST /auth/login
```
```json
{
  "email": "deepak@sunriseacademy.in",
  "password": "Admin@2026"
}
```
**Expected:** `200` + `{ data: { token, user } }`
**Save:** the `token` → use as `Bearer {{adminToken}}` for all dashboard calls

---

### Step 1.4 — Configure Class Settings
```
PUT /dashboard/settings
Authorization: Bearer {{adminToken}}
```
```json
{
  "className": "Sunrise Science Academy",
  "classEmail": "info@sunriseacademy.in",
  "classPhone": "9876543210",
  "classAddress": "14, Baner Road, Pune, Maharashtra 411045",
  "classWebsite": "https://sunriseacademy.in"
}
```
**Expected:** `200`

---

## PHASE 2 — Create Batches

### Step 2.1 — Batch: 11th Science Morning
```
POST /dashboard/batches
Authorization: Bearer {{adminToken}}
```
```json
{
  "name": "11th Science Morning",
  "timings": {
    "days": ["Monday", "Wednesday", "Friday"],
    "start": "07:00",
    "end": "09:00"
  }
}
```
**Expected:** `201` — **Save** `id` → `{{batch11Id}}`

---

### Step 2.2 — Batch: 12th Science Evening
```
POST /dashboard/batches
Authorization: Bearer {{adminToken}}
```
```json
{
  "name": "12th Science Evening",
  "timings": {
    "days": ["Tuesday", "Thursday", "Saturday"],
    "start": "17:00",
    "end": "19:00"
  }
}
```
**Expected:** `201` — **Save** `id` → `{{batch12Id}}`

---

### Step 2.3 — Verify Batches
```
GET /dashboard/batches
Authorization: Bearer {{adminToken}}
```
**Expected:** Array with 2 batches

---

## PHASE 3 — Add Teacher

### Step 3.1 — Create Teacher Account
```
POST /dashboard/teachers
Authorization: Bearer {{adminToken}}
```
```json
{
  "name": "Ravi Sharma",
  "email": "ravi.sharma@sunriseacademy.in"
}
```
**Expected:** `201` — **Save** `id` → `{{teacherId}}`
A registration email is sent to `ravi.sharma@sunriseacademy.in` (if NodeMailer is configured).

---

## PHASE 4 — Enroll Students

### Step 4.1 — Enroll Aarav Verma (11th batch)
```
POST /dashboard/students/enroll
Authorization: Bearer {{adminToken}}
```
```json
{
  "email": "aarav.verma@gmail.com",
  "firstname": "Aarav",
  "lastname": "Verma",
  "dob": "2009-08-14",
  "address": "22, Kothrud Colony, Pune, Maharashtra 411038",
  "batchId": {{batch11Id}},
  "phone": "9823456701",
  "parentName": "Suresh Verma",
  "grade": "11th"
}
```
**Expected:** `201` — **Save** `id` → `{{studentAaravId}}`

---

### Step 4.2 — Enroll Sneha Kulkarni (11th batch)
```
POST /dashboard/students/enroll
Authorization: Bearer {{adminToken}}
```
```json
{
  "email": "sneha.kulkarni@gmail.com",
  "firstname": "Sneha",
  "lastname": "Kulkarni",
  "dob": "2009-03-22",
  "address": "5, Karve Nagar, Pune, Maharashtra 411052",
  "batchId": {{batch11Id}},
  "phone": "9823456702",
  "parentName": "Anita Kulkarni",
  "grade": "11th"
}
```
**Expected:** `201` — **Save** `id` → `{{studentSnehaId}}`

---

### Step 4.3 — Enroll Rohit Desai (12th batch)
```
POST /dashboard/students/enroll
Authorization: Bearer {{adminToken}}
```
```json
{
  "email": "rohit.desai@gmail.com",
  "firstname": "Rohit",
  "lastname": "Desai",
  "dob": "2008-11-05",
  "address": "78, Aundh Road, Pune, Maharashtra 411007",
  "batchId": {{batch12Id}},
  "phone": "9823456703",
  "parentName": "Prakash Desai",
  "grade": "12th"
}
```
**Expected:** `201` — **Save** `id` → `{{studentRohitId}}`

---

### Step 4.4 — Enroll Kavya Nair (12th batch)
```
POST /dashboard/students/enroll
Authorization: Bearer {{adminToken}}
```
```json
{
  "email": "kavya.nair@gmail.com",
  "firstname": "Kavya",
  "lastname": "Nair",
  "dob": "2008-06-18",
  "address": "33, Shivajinagar, Pune, Maharashtra 411005",
  "batchId": {{batch12Id}},
  "phone": "9823456704",
  "parentName": "Meena Nair",
  "grade": "12th"
}
```
**Expected:** `201` — **Save** `id` → `{{studentKavyaId}}`

---

### Step 4.5 — Enroll Arjun Patil (12th batch)
```
POST /dashboard/students/enroll
Authorization: Bearer {{adminToken}}
```
```json
{
  "email": "arjun.patil@gmail.com",
  "firstname": "Arjun",
  "lastname": "Patil",
  "dob": "2008-01-30",
  "address": "101, Hadapsar, Pune, Maharashtra 411028",
  "batchId": {{batch12Id}},
  "phone": "9823456705",
  "parentName": "Manoj Patil",
  "grade": "12th"
}
```
**Expected:** `201` — **Save** `id` → `{{studentArjunId}}`

---

### Step 4.6 — Verify Enrollment
```
GET /dashboard/students?batchId={{batch11Id}}
Authorization: Bearer {{adminToken}}
```
**Expected:** 2 students (Aarav, Sneha)

```
GET /dashboard/students?batchId={{batch12Id}}
Authorization: Bearer {{adminToken}}
```
**Expected:** 3 students (Rohit, Kavya, Arjun)

---

## PHASE 5 — Lectures (Schedule + Attendance)

### Step 5.1 — Schedule a lecture for 11th batch
```
POST /dashboard/lectures
Authorization: Bearer {{adminToken}}
```
```json
{
  "title": "Introduction to Thermodynamics",
  "subject": "Physics",
  "description": "Laws of thermodynamics, heat engines, and entropy",
  "room": "Lab 1",
  "batchId": {{batch11Id}},
  "teacherId": {{teacherId}},
  "date": "2026-03-10",
  "startTime": "07:00",
  "endTime": "09:00"
}
```
**Expected:** `201` — **Save** `id` → `{{lecture11Id}}`

---

### Step 5.2 — Schedule bulk lectures for 12th batch (recurring)
```
POST /dashboard/lectures/bulk
Authorization: Bearer {{adminToken}}
```
```json
{
  "title": "Organic Chemistry",
  "subject": "Chemistry",
  "description": "Hydrocarbons, functional groups, IUPAC nomenclature",
  "room": "Room 3",
  "batchId": {{batch12Id}},
  "teacherId": {{teacherId}},
  "startTime": "17:00",
  "endTime": "19:00",
  "recurrence": {
    "days": ["TUESDAY", "THURSDAY"],
    "startDate": "2026-03-10",
    "endDate": "2026-03-31"
  }
}
```
**Expected:** `201` — multiple lectures created. **Save** first `id` → `{{lecture12Id}}`

---

### Step 5.3 — Mark attendance for the 11th lecture
```
POST /dashboard/attendance
Authorization: Bearer {{adminToken}}
```
```json
{
  "lectureId": {{lecture11Id}},
  "batchId": {{batch11Id}},
  "subject": "Physics",
  "date": "2026-03-10",
  "attendance": [
    { "studentId": {{studentAaravId}}, "status": "PRESENT" },
    { "studentId": {{studentSnehaId}}, "status": "ABSENT" }
  ]
}
```
**Expected:** `200`

---

### Step 5.4 — View attendance records
```
GET /dashboard/attendance?batchId={{batch11Id}}
Authorization: Bearer {{adminToken}}
```
**Expected:** attendance records with Aarav=PRESENT, Sneha=ABSENT

---

## PHASE 6 — Fee Management

### Step 6.1 — Create a fee structure for 11th batch
```
POST /dashboard/fees/structures
Authorization: Bearer {{adminToken}}
```
```json
{
  "batchId": {{batch11Id}},
  "name": "Monthly Tuition Fee — 11th Science",
  "amount": 3500,
  "frequency": "MONTHLY",
  "dueDay": 5,
  "lateFee": 100,
  "gracePeriod": 5,
  "description": "Monthly fee including study materials for 11th Science batch"
}
```
**Expected:** `201` — **Save** `id` → `{{feeStructure11Id}}`

---

### Step 6.2 — Create fee structure for 12th batch
```
POST /dashboard/fees/structures
Authorization: Bearer {{adminToken}}
```
```json
{
  "batchId": {{batch12Id}},
  "name": "Monthly Tuition Fee — 12th Science",
  "amount": 4000,
  "frequency": "MONTHLY",
  "dueDay": 5,
  "lateFee": 150,
  "gracePeriod": 5,
  "description": "Monthly fee for 12th Science with board exam preparation"
}
```
**Expected:** `201` — **Save** `id` → `{{feeStructure12Id}}`

---

### Step 6.3 — Bulk generate March receipts for 12th batch
```
POST /dashboard/fees/receipts/bulk
Authorization: Bearer {{adminToken}}
```
```json
{
  "batchId": {{batch12Id}},
  "feeStructureId": {{feeStructure12Id}},
  "academicMonth": 3,
  "academicYear": 2026,
  "dueDate": "2026-03-05"
}
```
**Expected:** `201` — 3 receipts created (one per student)

---

### Step 6.4 — Mark Rohit's fee as PAID (cash)
```
GET /dashboard/fees/receipts?batchId={{batch12Id}}&academicMonth=3&academicYear=2026
Authorization: Bearer {{adminToken}}
```
Find Rohit's receipt ID → **Save** → `{{rohitReceiptId}}`

```
PUT /dashboard/fees/receipts/{{rohitReceiptId}}
Authorization: Bearer {{adminToken}}
```
```json
{
  "paidAmount": 4000,
  "paymentMode": "CASH",
  "paymentDate": "2026-03-03",
  "status": "PAID",
  "paymentNotes": "Paid in person at the office"
}
```
**Expected:** `200`

---

### Step 6.5 — Mark Kavya as PARTIAL (UPI)
Find Kavya's receipt ID → **Save** → `{{kavyaReceiptId}}`

```
PUT /dashboard/fees/receipts/{{kavyaReceiptId}}
Authorization: Bearer {{adminToken}}
```
```json
{
  "paidAmount": 2000,
  "paymentMode": "UPI",
  "transactionId": "UPI20260303KAVYA001",
  "paymentDate": "2026-03-03",
  "status": "PARTIAL",
  "paymentNotes": "Remaining Rs.2000 to be paid by March 10"
}
```
**Expected:** `200`

---

## PHASE 7 — Announcements

### Step 7.1 — Post a class-wide announcement
```
POST /dashboard/announcements
Authorization: Bearer {{adminToken}}
```
```json
{
  "title": "Annual Picnic to Sinhagad Fort — March 20",
  "content": "Dear Students,\n\nWe are organising an annual picnic to Sinhagad Fort on March 20. Departure at 7 AM from the academy.\n\nFee: Rs. 300 per student. Please submit fees at the office by March 15.\n\nBring comfortable shoes, water, and a packed lunch. Limited seats — register early!\n\n– Admin",
  "isImportant": true
}
```
**Expected:** `201`

---

### Step 7.2 — Post a batch-specific announcement
```
POST /dashboard/announcements
Authorization: Bearer {{adminToken}}
```
```json
{
  "title": "12th Batch: Physics Revision Schedule for Board Exams",
  "content": "Attention 12th Science students,\n\nSpecial revision lectures for Physics will be held every Saturday from 9 AM to 12 PM starting March 14. Attendance is mandatory.\n\nTopics covered: Electrostatics, Current Electricity, Optics, Dual Nature of Radiation.",
  "batchId": {{batch12Id}},
  "isImportant": true
}
```
**Expected:** `201`

---

## PHASE 8 — Tests & Exams

### Step 8.1 — Create a Unit Test for 12th batch
```
POST /dashboard/tests
Authorization: Bearer {{adminToken}}
```
```json
{
  "title": "Unit Test 1 — Organic Chemistry",
  "subject": "Chemistry",
  "description": "Covers hydrocarbons and functional groups",
  "testType": "UNIT_TEST",
  "batchId": {{batch12Id}},
  "totalMarks": 50,
  "passingMarks": 20,
  "date": "2026-03-15",
  "time": "17:00",
  "duration": 90,
  "hall": "Examination Hall A",
  "syllabus": "Chapter 13: Hydrocarbons\nChapter 14: Haloalkanes and Haloarenes\nChapter 15: Alcohols, Phenols and Ethers",
  "instructions": "All questions are compulsory. Show full working for numerical problems."
}
```
**Expected:** `201` — **Save** `id` → `{{test12Id}}`

---

### Step 8.2 — Upload scores for all 12th batch students
```
POST /dashboard/tests/{{test12Id}}/scores
Authorization: Bearer {{adminToken}}
```
```json
{ "studentId": {{studentRohitId}}, "marksObtained": 43, "remarks": "Excellent work on nomenclature section" }
```
```
POST /dashboard/tests/{{test12Id}}/scores
Authorization: Bearer {{adminToken}}
```
```json
{ "studentId": {{studentKavyaId}}, "marksObtained": 38, "remarks": "Good attempt. Work on reaction mechanisms" }
```
```
POST /dashboard/tests/{{test12Id}}/scores
Authorization: Bearer {{adminToken}}
```
```json
{ "studentId": {{studentArjunId}}, "marksObtained": 27, "remarks": "Passed. Focus more on organic reactions" }
```
**Expected:** All `201`

---

### Step 8.3 — Publish results
```
PUT /dashboard/tests/{{test12Id}}/publish
Authorization: Bearer {{adminToken}}
```
**Expected:** `200` — status → PUBLISHED, scoresLocked = true, publishedAt set

---

### Step 8.4 — Export scores as CSV
```
GET /dashboard/tests/{{test12Id}}/export-csv
Authorization: Bearer {{adminToken}}
```
**Expected:** CSV download with columns: Student Name, Marks Obtained, Total Marks, Percentage, Grade, Pass/Fail

---

## PHASE 9 — Assignments

### Step 9.1 — Create an assignment for 12th batch
```
POST /dashboard/assignments
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data
```
```
title: Haloalkanes — Practice Problems
subject: Chemistry
description: Solve all 15 questions from the NCERT exercise. Show step-by-step mechanism for each organic reaction.
batchIds: [{{batch12Id}}]
dueDate: 2026-03-18T19:00:00.000Z
submissionType: FILE
assignmentStatus: ACTIVE
allowLateSubmissions: false
```
**Expected:** `201` — **Save** the `id` (slotId) → `{{assignmentSlotId}}`

---

### Step 9.2 — View submissions for review
```
GET /dashboard/assignments/{{assignmentSlotId}}/review
Authorization: Bearer {{adminToken}}
```
**Expected:** Page with slot info + list of students (initially all MISSING)

---

## PHASE 10 — App Auth (Student & Teacher Setup)

### Step 10.1 — Teacher: Check enrollment
```
POST /app/auth/check-enrollment
```
```json
{ "email": "ravi.sharma@sunriseacademy.in" }
```
**Expected:** `{ isRegistered: true, hasPassword: false, role: "TEACHER" }`

---

### Step 10.2 — Teacher: Set password (first time)
```
POST /app/auth/setup-password
```
```json
{
  "email": "ravi.sharma@sunriseacademy.in",
  "password": "Teacher@2026"
}
```
**Expected:** `200` — welcome email sent

---

### Step 10.3 — Teacher: Login
```
POST /app/auth/login
```
```json
{
  "email": "ravi.sharma@sunriseacademy.in",
  "password": "Teacher@2026"
}
```
**Expected:** `200` + `{ data: { accessToken, refreshToken, user } }`
**Save:** `accessToken` → `{{teacherToken}}`

---

### Step 10.4 — Student: Check enrollment (Aarav)
```
POST /app/auth/check-enrollment
```
```json
{ "email": "aarav.verma@gmail.com" }
```
**Expected:** `{ isRegistered: true, hasPassword: false, role: "STUDENT" }`

---

### Step 10.5 — Student: Set password
```
POST /app/auth/setup-password
```
```json
{
  "email": "aarav.verma@gmail.com",
  "password": "Aarav@2026"
}
```
**Expected:** `200`

---

### Step 10.6 — Student: Login
```
POST /app/auth/login
```
```json
{
  "email": "aarav.verma@gmail.com",
  "password": "Aarav@2026"
}
```
**Expected:** `200` + `{ data: { accessToken, refreshToken, user, student } }`
**Save:** `accessToken` → `{{studentToken}}`

---

## PHASE 11 — Student App Features

### Step 11.1 — Student: View schedule
```
GET /app/lectures?month=2026-03
Authorization: Bearer {{studentToken}}
```
**Expected:** Thermodynamics lecture on March 10

---

### Step 11.2 — Student: View attendance summary
```
GET /app/attendance
Authorization: Bearer {{studentToken}}
```
**Expected:** 1 attendance record — Physics, PRESENT

---

### Step 11.3 — Student: View fee status
```
GET /app/fees
Authorization: Bearer {{studentToken}}
```
**Expected:** Aarav has no receipts yet (only 12th batch got bulk receipts)

Quick test — generate receipt for Aarav:
```
POST /dashboard/fees/receipts
Authorization: Bearer {{adminToken}}
```
```json
{
  "studentId": {{studentAaravId}},
  "batchId": {{batch11Id}},
  "feeStructureId": {{feeStructure11Id}},
  "totalAmount": 3500,
  "paidAmount": 3500,
  "paymentMode": "UPI",
  "transactionId": "UPI20260301AARAV001",
  "paymentDate": "2026-03-01",
  "academicMonth": 3,
  "academicYear": 2026,
  "dueDate": "2026-03-05"
}
```
Now `GET /app/fees` → shows 1 receipt (PAID)

---

### Step 11.4 — Student: View announcements
```
GET /app/announcements
Authorization: Bearer {{studentToken}}
```
**Expected:** The "Annual Picnic" announcement (isImportant=true shows first)

---

### Step 11.5 — Student: View upcoming assignments
```
GET /app/assignments?status=pending
Authorization: Bearer {{studentToken}}
```
**Expected:** Aarav sees no assignments (he's in 11th batch, assignment was for 12th)

Switch to Rohit (from 12th batch):
```
POST /app/auth/login
```
```json
{ "email": "rohit.desai@gmail.com", "password": "Rohit@2026" }
```
*(First run steps 10.4–10.6 for rohit.desai@gmail.com with password "Rohit@2026")*

```
GET /app/assignments?status=pending
Authorization: Bearer {{rohitToken}}
```
**Expected:** Haloalkanes assignment — due 2026-03-18

---

### Step 11.6 — Student: View test results
```
GET /app/tests
Authorization: Bearer {{rohitToken}}
```
**Expected:** Unit Test 1 — Organic Chemistry — 43/50, PASS, Grade A

---

### Step 11.7 — Student: Post a doubt
```
POST /app/doubts
Authorization: Bearer {{rohitToken}}
```
```json
{
  "title": "SN1 vs SN2 — how to determine which mechanism applies?",
  "description": "I'm getting confused between SN1 and SN2 mechanisms. In problems how do I know which one to use? Does it depend on the type of carbon (primary/secondary/tertiary) or the nucleophile strength?",
  "subject": "Chemistry"
}
```
**Expected:** `201` — **Save** `id` → `{{doubtId}}`

---

## PHASE 12 — Teacher App Features

### Step 12.1 — Teacher: View their batches
```
GET /app/attendance/teacher/batches
Authorization: Bearer {{teacherToken}}
```
**Expected:** Both batches (11th Morning, 12th Evening) — teacher is assigned to lectures in both

---

### Step 12.2 — Teacher: View doubts from their batches
```
GET /app/doubts/teacher
Authorization: Bearer {{teacherToken}}
```
**Expected:** Rohit's SN1 vs SN2 doubt

---

### Step 12.3 — Teacher: Reply to the doubt
```
POST /app/doubts/{{doubtId}}/reply
Authorization: Bearer {{teacherToken}}
```
```json
{
  "content": "Great question Rohit! Here's the rule of thumb:\n\n**SN2** → Primary carbons (less steric hindrance) + strong nucleophile (CN⁻, I⁻, RS⁻)\n**SN1** → Tertiary carbons (stable carbocation) + weak/polar nucleophile (H₂O, ROH)\n\nSecondary carbons can go either way depending on conditions.\n\nFor board exams, always check the carbon type first — if tertiary, default to SN1. If primary, default to SN2. We'll do a full practice set on Thursday!"
}
```
**Expected:** `201`

---

### Step 12.4 — Student: Mark doubt as resolved
```
PUT /app/doubts/{{doubtId}}/resolve
Authorization: Bearer {{rohitToken}}
```
**Expected:** `200` — doubt status → RESOLVED

---

### Step 12.5 — Teacher: View assignment submissions
```
GET /app/assignments/teacher
Authorization: Bearer {{teacherToken}}
```
**Expected:** Haloalkanes assignment with stats (0 submitted, 3 missing)

---

### Step 12.6 — Teacher: Post an announcement
```
POST /app/announcements/teacher
Authorization: Bearer {{teacherToken}}
Content-Type: multipart/form-data
```
```
title: Thursday's class — bring NCERT Part 2
content: Students, for Thursday's Organic Chemistry class please bring your NCERT Chemistry Part 2 textbook. We'll be working through Exercise 13.1 to 13.4 in class. Also revise Chapter 11 (Alcohols) from Part 1.
```
**Expected:** `201`

---

## PHASE 13 — Security Tests (verify fixed bugs)

### Step 13.1 — Logout invalidates the token
```
POST /auth/logout
Authorization: Bearer {{adminToken}}
```
**Expected:** `200`

Now try using the same token:
```
GET /dashboard/batches
Authorization: Bearer {{adminToken}}
```
**Expected:** `401` — "Token has been revoked. Please login again."
✅ Bug 2 is fixed — logout now works.

---

### Step 13.2 — Forgot password doesn't leak token
```
POST /auth/request-password-reset
```
```json
{ "email": "deepak@sunriseacademy.in" }
```
**Expected:** `200` — `{ success: true, message: "Password reset instructions have been sent to your email." }`
**Confirm:** The response body does NOT contain any token.
An email is sent to deepak@sunriseacademy.in with the reset token.
✅ Bug 3 is fixed.

---

### Step 13.3 — SALT fallback works
Check server logs on startup — no NaN errors in bcrypt.
✅ Bug 1 is fixed.

---

### Step 13.4 — App logout + blacklist
```
POST /app/auth/logout
Authorization: Bearer {{studentToken}}
```
**Expected:** `200`

```
GET /app/lectures
Authorization: Bearer {{studentToken}}
```
**Expected:** `401` — "Token has been revoked. Please login again."
✅ Pre-existing behaviour confirmed still works.

---

## PHASE 14 — QR Attendance (bonus)

### Step 14.1 — Generate QR for a lecture
```
POST /dashboard/attendance/qr/generate
Authorization: Bearer {{adminToken}}
```
```json
{
  "lectureId": {{lecture12Id}},
  "batchId": {{batch12Id}},
  "validForMinutes": 10
}
```
**Expected:** `200` + `{ qrToken, expiresAt }` — the QR token encodes this for the student to scan

---

### Step 14.2 — Student scans QR (simulate)
```
POST /app/attendance/qr/scan
Authorization: Bearer {{rohitToken}}
```
```json
{ "token": "{{qrToken}}" }
```
**Expected:** `200` — attendance marked PRESENT for Rohit

---

## Quick Reference — IDs to Track

| Variable | Description |
|----------|-------------|
| `{{adminToken}}` | Dashboard JWT (re-login after logout test) |
| `{{teacherToken}}` | Teacher app JWT |
| `{{studentToken}}` | Aarav's app JWT |
| `{{rohitToken}}` | Rohit's app JWT |
| `{{batch11Id}}` | 11th Science Morning batch ID |
| `{{batch12Id}}` | 12th Science Evening batch ID |
| `{{teacherId}}` | Ravi Sharma's User ID |
| `{{studentAaravId}}` | Aarav Verma's Student ID |
| `{{studentSnehaId}}` | Sneha Kulkarni's Student ID |
| `{{studentRohitId}}` | Rohit Desai's Student ID |
| `{{studentKavyaId}}` | Kavya Nair's Student ID |
| `{{studentArjunId}}` | Arjun Patil's Student ID |
| `{{lecture11Id}}` | Thermodynamics lecture ID |
| `{{lecture12Id}}` | First Organic Chemistry lecture ID |
| `{{feeStructure11Id}}` | 11th batch fee structure ID |
| `{{feeStructure12Id}}` | 12th batch fee structure ID |
| `{{test12Id}}` | Organic Chemistry Unit Test ID |
| `{{assignmentSlotId}}` | Haloalkanes assignment slot ID |
| `{{doubtId}}` | Rohit's SN1/SN2 doubt ID |

---

## Coverage Checklist

| Feature | Tested |
|---------|--------|
| Admin signup + login | ✅ Phase 1 |
| Class settings | ✅ Phase 1 |
| Batch creation | ✅ Phase 2 |
| Teacher creation + app auth | ✅ Phase 3, 10 |
| Student enrollment + app auth | ✅ Phase 4, 10 |
| Lecture scheduling (single + bulk) | ✅ Phase 5 |
| Attendance marking (dashboard) | ✅ Phase 5 |
| Fee structure + receipts | ✅ Phase 6 |
| Bulk fee generation | ✅ Phase 6 |
| Fee payment recording | ✅ Phase 6 |
| Announcements | ✅ Phase 7 |
| Test creation + score upload | ✅ Phase 8 |
| Test publish + CSV export | ✅ Phase 8 |
| Assignment creation + review | ✅ Phase 9 |
| Student: schedule/attendance/fees/tests | ✅ Phase 11 |
| Student: doubts + assignment view | ✅ Phase 11 |
| Teacher: batch list + doubt reply | ✅ Phase 12 |
| Teacher: announcement | ✅ Phase 12 |
| Logout token blacklist (Bug 2 fix) | ✅ Phase 13 |
| ForgotPassword no token leak (Bug 3 fix) | ✅ Phase 13 |
| QR attendance | ✅ Phase 14 |
