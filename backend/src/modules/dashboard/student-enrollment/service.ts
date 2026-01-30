import { Prisma, Student, UserRoles } from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../config/db.config";
import {
  EnrollStudentInput,
  CSVStudentRow,
  CSVImportResult,
  CSVImportError,
  CSVPreviewData,
} from "./types";
import { parseCSV, normalizeDateFormat, generateSampleCSV } from "./csv.utils";

export default class StudentEnrollmentService {
  /**
   * Enroll a single student
   * Creates both User (with password=null, isPasswordSet=false) and Student records
   */
  public async enrollSingle(student: EnrollStudentInput): Promise<Student> {
    try {
      const normalizedEmail = student.email.toLowerCase();

      // Check if student already exists
      const alreadyExist = await prisma.student.findUnique({
        where: { email: normalizedEmail },
      });

      if (alreadyExist) {
        throw new Error("Student with this email already exists");
      }

      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      // Validate batch exists
      const batch = await prisma.batch.findUnique({
        where: { id: student.batchId },
      });

      if (!batch) {
        throw new Error(`Batch with ID ${student.batchId} not found`);
      }

      const fullname =
        student.firstname +
        " " +
        (student.middlename ? student.middlename + " " : "") +
        student.lastname;

      const { batchId, ...studentData } = student;

      // Create User + Student together in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create User with password=null, isPasswordSet=false
        const user = await tx.user.create({
          data: {
            name: fullname,
            email: normalizedEmail,
            password: null,
            role: UserRoles.STUDENT,
            isPasswordSet: false,
          },
        });

        // Create Student with userId linking to the new User
        const newStudent = await tx.student.create({
          data: {
            ...studentData,
            email: normalizedEmail,
            fullname,
            userId: user.id,
            batchId: batchId,
          },
        });

        return newStudent;
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Preview CSV data before importing
   */
  public async previewCSV(
    fileContent: string,
    batchId: number
  ): Promise<CSVPreviewData> {
    try {
      // Validate batch exists
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        throw new Error(`Batch with ID ${batchId} not found`);
      }

      const { rows, errors } = parseCSV(fileContent);

      // Check for duplicate student emails in database
      const studentEmailsInDB = await prisma.student.findMany({
        where: {
          email: { in: rows.map((r) => r.email.toLowerCase()) },
        },
        select: { email: true },
      });

      // Check for duplicate user emails in database
      const userEmailsInDB = await prisma.user.findMany({
        where: {
          email: { in: rows.map((r) => r.email.toLowerCase()) },
        },
        select: { email: true },
      });

      const existingStudentEmails = new Set(studentEmailsInDB.map((s) => s.email.toLowerCase()));
      const existingUserEmails = new Set(userEmailsInDB.map((u) => u.email.toLowerCase()));

      // Check for duplicate emails within CSV
      const emailCounts = new Map<string, number>();
      rows.forEach((row, index) => {
        const email = row.email.toLowerCase();
        if (emailCounts.has(email)) {
          errors.push({
            row: index + 2, // +2 because of header and 0-indexing
            email: row.email,
            error: "Duplicate email in CSV",
          });
        }
        emailCounts.set(email, (emailCounts.get(email) || 0) + 1);

        if (existingStudentEmails.has(email)) {
          errors.push({
            row: index + 2,
            email: row.email,
            error: "Student with this email already exists in database",
          });
        } else if (existingUserEmails.has(email)) {
          errors.push({
            row: index + 2,
            email: row.email,
            error: "User with this email already exists in database",
          });
        }
      });

      // Filter valid rows (no errors)
      const errorRows = new Set(errors.map((e) => e.row));
      const validRows = rows.filter((_, index) => !errorRows.has(index + 2));

      return {
        totalRows: rows.length,
        validRows: validRows.length,
        invalidRows: errors.length,
        preview: rows.slice(0, 10), // Return first 10 rows for preview
        errors: errors.slice(0, 50), // Limit errors shown
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import students from CSV
   * Creates both User (with password=null, isPasswordSet=false) and Student records for each row
   */
  public async enrollCSV(
    fileContent: string,
    batchId: number
  ): Promise<CSVImportResult> {
    try {
      // Validate batch exists
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        throw new Error(`Batch with ID ${batchId} not found`);
      }

      const { rows, errors } = parseCSV(fileContent);

      if (rows.length === 0) {
        return {
          total: 0,
          successful: 0,
          failed: errors.length,
          errors,
          imported: [],
        };
      }

      // Get existing student emails to check for duplicates
      const studentEmailsInDB = await prisma.student.findMany({
        where: {
          email: { in: rows.map((r) => r.email.toLowerCase()) },
        },
        select: { email: true },
      });

      // Get existing user emails to check for duplicates
      const userEmailsInDB = await prisma.user.findMany({
        where: {
          email: { in: rows.map((r) => r.email.toLowerCase()) },
        },
        select: { email: true },
      });

      const existingStudentEmails = new Set(studentEmailsInDB.map((s) => s.email.toLowerCase()));
      const existingUserEmails = new Set(userEmailsInDB.map((u) => u.email.toLowerCase()));

      // Track emails being imported to catch duplicates in CSV
      const importedEmails = new Set<string>();
      const imported: any[] = [];
      const importErrors: CSVImportError[] = [...errors];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const email = row.email.toLowerCase();

        // Skip if student email already exists
        if (existingStudentEmails.has(email)) {
          importErrors.push({
            row: i + 2,
            email: row.email,
            error: "Student with this email already exists in database",
          });
          continue;
        }

        // Skip if user email already exists
        if (existingUserEmails.has(email)) {
          importErrors.push({
            row: i + 2,
            email: row.email,
            error: "User with this email already exists in database",
          });
          continue;
        }

        if (importedEmails.has(email)) {
          importErrors.push({
            row: i + 2,
            email: row.email,
            error: "Duplicate email in CSV",
          });
          continue;
        }

        try {
          const fullname =
            row.firstname.trim() +
            " " +
            (row.middlename ? row.middlename.trim() + " " : "") +
            row.lastname.trim();

          // Create User + Student together in a transaction
          const student = await prisma.$transaction(async (tx) => {
            // Create User with password=null, isPasswordSet=false
            const user = await tx.user.create({
              data: {
                name: fullname,
                email: email,
                password: null,
                role: UserRoles.STUDENT,
                isPasswordSet: false,
              },
            });

            // Create Student with userId linking to the new User
            const newStudent = await tx.student.create({
              data: {
                firstname: row.firstname.trim(),
                middlename: row.middlename?.trim() || "",
                lastname: row.lastname.trim(),
                fullname,
                email: email,
                dob: normalizeDateFormat(row.dob),
                address: row.address?.trim() || "",
                userId: user.id,
                batchId: batchId,
              },
            });

            return newStudent;
          });

          importedEmails.add(email);
          imported.push(student);
        } catch (error: any) {
          importErrors.push({
            row: i + 2,
            email: row.email,
            error: error.message || "Failed to create student",
          });
        }
      }

      return {
        total: rows.length,
        successful: imported.length,
        failed: importErrors.length,
        errors: importErrors,
        imported,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all students (optionally filtered by batch)
   */
  public async getAll(batchId?: number): Promise<Student[]> {
    try {
      if (batchId) {
        const batch = await prisma.batch.findUnique({
          where: { id: batchId },
        });

        if (!batch) {
          throw new Error("Batch not found");
        }
      }

      const select: Prisma.StudentSelect = {
        id: true,
        firstname: true,
        middlename: true,
        lastname: true,
        fullname: true,
        email: true,
        dob: true,
        address: true,
        batchId: true,
        createdAt: true,
        updatedAt: true,
      };

      const where: Prisma.StudentWhereInput = {
        isDeleted: false,
      };

      if (batchId) {
        where.batchId = batchId;
      }

      const students = await prisma.student.findMany({
        where,
        select,
        orderBy: { createdAt: "desc" },
      });

      return students;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single student by ID
   */
  public async getById(id: number): Promise<Student> {
    try {
      const student = await prisma.student.findUnique({
        where: { id, isDeleted: false },
        include: {
          batch: {
            select: { id: true, name: true },
          },
        },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      return student;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a student
   */
  public async update(
    id: number,
    data: Partial<EnrollStudentInput>
  ): Promise<Student> {
    try {
      const student = await this.getById(id);

      // If updating email, check for duplicates
      if (data.email && data.email !== student.email) {
        const existing = await prisma.student.findUnique({
          where: { email: data.email },
        });

        if (existing) {
          throw new Error("Email already in use by another student");
        }
      }

      // If updating batch, validate it exists
      if (data.batchId) {
        const batch = await prisma.batch.findUnique({
          where: { id: data.batchId },
        });

        if (!batch) {
          throw new Error(`Batch with ID ${data.batchId} not found`);
        }
      }

      // Rebuild fullname if name parts are updated
      let fullname = student.fullname;
      if (data.firstname || data.middlename !== undefined || data.lastname) {
        const firstname = data.firstname || student.firstname;
        const middlename =
          data.middlename !== undefined ? data.middlename : student.middlename;
        const lastname = data.lastname || student.lastname;
        fullname = `${firstname} ${middlename ? middlename + " " : ""}${lastname}`;
      }

      const { batchId, ...updateData } = data;

      const updated = await prisma.student.update({
        where: { id },
        data: {
          ...updateData,
          fullname,
          ...(batchId && { batch: { connect: { id: batchId } } }),
        },
      });

      return updated;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete (soft) a student
   */
  public async delete(id: number, deletedBy: string): Promise<void> {
    try {
      await this.getById(id); // Verify exists

      await prisma.student.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedBy,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get sample CSV template
   */
  public getSampleCSV(): string {
    return generateSampleCSV();
  }

  /**
   * Get student profile by email (for authenticated student users)
   */
  public async getByEmail(email: string): Promise<Student | null> {
    try {
      const student = await prisma.student.findUnique({
        where: { email: email.toLowerCase(), isDeleted: false },
        include: {
          batch: {
            select: { id: true, name: true },
          },
        },
      });

      return student;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all soft-deleted students
   */
  public async getDeleted(): Promise<Student[]> {
    try {
      const students = await prisma.student.findMany({
        where: { isDeleted: true },
        include: {
          batch: {
            select: { id: true, name: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return students;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restore soft-deleted students
   */
  public async restore(ids: number[]): Promise<{ restored: number }> {
    try {
      const result = await prisma.student.updateMany({
        where: {
          id: { in: ids },
          isDeleted: true,
        },
        data: {
          isDeleted: false,
          deletedBy: null,
        },
      });

      return { restored: result.count };
    } catch (error) {
      throw error;
    }
  }

  // =====================
  // DANGER ZONE - HARD DELETE OPERATIONS
  // =====================

  /**
   * Permanently delete a student (DANGER: This cannot be undone!)
   */
  public async hardDelete(id: number): Promise<void> {
    try {
      // First delete related attendance records
      await prisma.attendance.deleteMany({
        where: { studentId: id },
      });

      // Then delete the student
      await prisma.student.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Permanently delete multiple students (DANGER: This cannot be undone!)
   */
  public async hardDeleteMany(ids: number[]): Promise<{ deleted: number }> {
    try {
      // First delete related attendance records
      await prisma.attendance.deleteMany({
        where: { studentId: { in: ids } },
      });

      // Then delete the students
      const result = await prisma.student.deleteMany({
        where: { id: { in: ids } },
      });

      return { deleted: result.count };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Permanently delete all soft-deleted students (DANGER: This cannot be undone!)
   */
  public async purgeDeleted(): Promise<{ deleted: number }> {
    try {
      const deletedStudents = await prisma.student.findMany({
        where: { isDeleted: true },
        select: { id: true },
      });

      const ids = deletedStudents.map((s) => s.id);

      if (ids.length === 0) {
        return { deleted: 0 };
      }

      // First delete related attendance records
      await prisma.attendance.deleteMany({
        where: { studentId: { in: ids } },
      });

      // Then delete the students
      const result = await prisma.student.deleteMany({
        where: { id: { in: ids } },
      });

      return { deleted: result.count };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get students with attendance stats for a batch
   */
  public async getStudentsWithStats(batchId: number): Promise<any[]> {
    try {
      // Validate batch exists
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        throw new Error("Batch not found");
      }

      // Get all students in the batch
      const students = await prisma.student.findMany({
        where: { batchId, isDeleted: false },
        include: {
          batch: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Get attendance records for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          batchId,
          date: { gte: thirtyDaysAgo },
        },
        select: {
          studentId: true,
          status: true,
        },
      });

      // Calculate stats for each student
      const statsMap = new Map<number, { present: number; absent: number }>();

      attendanceRecords.forEach((record) => {
        if (!statsMap.has(record.studentId)) {
          statsMap.set(record.studentId, { present: 0, absent: 0 });
        }
        const stats = statsMap.get(record.studentId)!;
        if (record.status === "PRESENT") {
          stats.present++;
        } else {
          stats.absent++;
        }
      });

      // Combine students with stats
      return students.map((student) => {
        const stats = statsMap.get(student.id);
        const totalDays = stats ? stats.present + stats.absent : 0;
        const percentage = totalDays > 0 ? (stats!.present / totalDays) * 100 : 0;

        return {
          ...student,
          attendanceStats: stats
            ? {
                totalDays,
                presentDays: stats.present,
                absentDays: stats.absent,
                percentage: Math.round(percentage * 10) / 10,
              }
            : undefined,
        };
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get detailed student profile with all related data
   */
  public async getDetailedProfile(id: number): Promise<any> {
    try {
      const student = await prisma.student.findUnique({
        where: { id, isDeleted: false },
        include: {
          batch: {
            select: {
              id: true,
              name: true,
              timings: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isPasswordSet: true,
              createdAt: true,
            },
          },
        },
      });

      if (!student) {
        throw new Error("Student not found");
      }

      // Get attendance records (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          studentId: id,
          date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: "desc" },
        take: 30,
      });

      // Calculate attendance stats
      const present = attendanceRecords.filter((r) => r.status === "PRESENT").length;
      const absent = attendanceRecords.filter((r) => r.status === "ABSENT").length;
      const total = present + absent;
      const percentage = total > 0 ? (present / total) * 100 : 0;

      // Get fees summary
      const feeReceipts = await prisma.feeReceipt.findMany({
        where: { studentId: id },
        select: {
          totalAmount: true,
          paidAmount: true,
          remainingAmount: true,
          status: true,
        },
      });

      const feesSummary = {
        totalDue: feeReceipts.reduce((sum, r) => sum + r.totalAmount, 0),
        totalPaid: feeReceipts.reduce((sum, r) => sum + r.paidAmount, 0),
        totalPending: feeReceipts.reduce((sum, r) => sum + r.remainingAmount, 0),
        overdueReceipts: feeReceipts.filter((r) => r.status === "OVERDUE").length,
      };

      return {
        ...student,
        attendanceRecords,
        attendanceStats: {
          totalDays: total,
          presentDays: present,
          absentDays: absent,
          percentage: Math.round(percentage * 10) / 10,
        },
        feesSummary,
      };
    } catch (error) {
      throw error;
    }
  }
}
