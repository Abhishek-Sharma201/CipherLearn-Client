# CipherLearn Caching Strategy

## Overview

This document outlines a production-level caching strategy using `node-cache` to reduce database load, improve response times, and optimize backend performance.

## Table of Contents

1. [Cache Architecture](#cache-architecture)
2. [Installation & Setup](#installation--setup)
3. [Cache Service Implementation](#cache-service-implementation)
4. [Caching Patterns](#caching-patterns)
5. [Cache Keys Strategy](#cache-keys-strategy)
6. [TTL (Time-To-Live) Guidelines](#ttl-guidelines)
7. [Cache Invalidation](#cache-invalidation)
8. [Implementation Examples](#implementation-examples)
9. [Monitoring & Metrics](#monitoring--metrics)
10. [Best Practices](#best-practices)

---

## Cache Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Request                               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Cache Middleware                             │
│              (Check cache before hitting DB)                     │
└─────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│     Cache HIT           │       │     Cache MISS          │
│   Return cached data    │       │   Query Database        │
└─────────────────────────┘       └─────────────────────────┘
                                              │
                                              ▼
                                  ┌─────────────────────────┐
                                  │   Store in Cache        │
                                  │   Return response       │
                                  └─────────────────────────┘
```

### Cache Layers

```
Layer 1: In-Memory Cache (node-cache)
├── Hot data: Frequently accessed, low TTL
├── Warm data: Moderately accessed, medium TTL
└── Cold data: Rarely changes, high TTL

Layer 2: Database Query Cache
├── Prisma query optimization
└── Connection pooling

Layer 3: Response Cache
├── Static responses
└── Computed aggregations
```

---

## Installation & Setup

### Install Dependencies

```bash
npm install node-cache
npm install -D @types/node-cache
```

### Directory Structure

```
backend/src/
├── cache/
│   ├── index.ts           # Cache service singleton
│   ├── keys.ts            # Cache key definitions
│   ├── middleware.ts      # Cache middleware
│   └── invalidation.ts    # Cache invalidation helpers
```

---

## Cache Service Implementation

### `src/cache/index.ts`

```typescript
import NodeCache from "node-cache";
import logger from "../utils/logger";

export interface CacheOptions {
  stdTTL?: number;      // Default TTL in seconds
  checkperiod?: number; // Period for checking expired keys
  maxKeys?: number;     // Maximum number of keys
}

class CacheService {
  private cache: NodeCache;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: CacheOptions = {}) {
    this.cache = new NodeCache({
      stdTTL: options.stdTTL || 300,        // 5 minutes default
      checkperiod: options.checkperiod || 60, // Check every minute
      maxKeys: options.maxKeys || 10000,     // Max 10k keys
      useClones: false,                       // Better performance
      deleteOnExpire: true,
    });

    // Log cache events
    this.cache.on("expired", (key) => {
      logger.debug(`Cache expired: ${key}`);
    });

    this.cache.on("flush", () => {
      logger.info("Cache flushed");
    });
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.hits++;
      logger.debug(`Cache HIT: ${key}`);
    } else {
      this.misses++;
      logger.debug(`Cache MISS: ${key}`);
    }
    return value;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl !== undefined) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  /**
   * Delete specific key
   */
  del(key: string | string[]): number {
    return this.cache.del(key);
  }

  /**
   * Delete keys matching pattern
   */
  delByPattern(pattern: string): number {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern);
    const matchingKeys = keys.filter((key) => regex.test(key));
    return this.cache.del(matchingKeys);
  }

  /**
   * Flush entire cache
   */
  flush(): void {
    this.cache.flushAll();
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = this.cache.getStats();
    return {
      ...stats,
      hitRate: this.hits / (this.hits + this.misses) || 0,
      hits: this.hits,
      misses: this.misses,
      keys: this.cache.keys().length,
    };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return this.cache.keys();
  }

  /**
   * Reset stats
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.cache.flushStats();
  }
}

// Singleton instances for different cache purposes
export const appCache = new CacheService({ stdTTL: 300, maxKeys: 5000 });
export const analyticsCache = new CacheService({ stdTTL: 600, maxKeys: 1000 });
export const sessionCache = new CacheService({ stdTTL: 3600, maxKeys: 10000 });

export default CacheService;
```

---

## Cache Keys Strategy

### `src/cache/keys.ts`

```typescript
/**
 * Cache key generators for consistent key naming
 * Format: {domain}:{entity}:{identifier}:{qualifier}
 */

export const CacheKeys = {
  // ==================== BATCHES ====================
  batches: {
    all: () => "batches:all",
    byId: (id: number) => `batches:${id}`,
    withStudents: (id: number) => `batches:${id}:students`,
    count: () => "batches:count",
  },

  // ==================== STUDENTS ====================
  students: {
    all: () => "students:all",
    byId: (id: number) => `students:${id}`,
    byBatch: (batchId: number) => `students:batch:${batchId}`,
    byEmail: (email: string) => `students:email:${email.toLowerCase()}`,
    count: () => "students:count",
    countByBatch: (batchId: number) => `students:batch:${batchId}:count`,
  },

  // ==================== ATTENDANCE ====================
  attendance: {
    byBatchDate: (batchId: number, date: string) =>
      `attendance:batch:${batchId}:date:${date}`,
    byStudent: (studentId: number) => `attendance:student:${studentId}`,
    matrix: (studentId: number, month: number, year: number) =>
      `attendance:matrix:${studentId}:${year}-${month}`,
    sheet: (batchId: number) => `attendance:sheet:${batchId}`,
    report: (batchId: number, start: string, end: string) =>
      `attendance:report:${batchId}:${start}:${end}`,
  },

  // ==================== ASSIGNMENTS ====================
  assignments: {
    all: () => "assignments:all",
    byId: (id: number) => `assignments:${id}`,
    byBatch: (batchId: number) => `assignments:batch:${batchId}`,
    submissions: (slotId: number) => `assignments:${slotId}:submissions`,
    studentSubmission: (slotId: number, studentId: number) =>
      `assignments:${slotId}:student:${studentId}`,
    stats: (studentId: number) => `assignments:stats:${studentId}`,
  },

  // ==================== FEES ====================
  fees: {
    structures: (batchId: number) => `fees:structures:${batchId}`,
    receipts: (studentId: number) => `fees:receipts:${studentId}`,
    summary: (studentId: number) => `fees:summary:${studentId}`,
    batchSummary: (batchId: number) => `fees:batch:${batchId}:summary`,
  },

  // ==================== ANALYTICS ====================
  analytics: {
    dashboard: () => "analytics:dashboard",
    enrollmentTrends: (months: number) => `analytics:enrollment:${months}`,
    attendanceTrends: (days: number, batchId?: number) =>
      `analytics:attendance:${days}:${batchId || "all"}`,
    monthlyAttendance: (months: number, batchId?: number) =>
      `analytics:monthly-attendance:${months}:${batchId || "all"}`,
    batchDistribution: () => "analytics:batch-distribution",
    recentActivities: (limit: number) => `analytics:activities:${limit}`,
  },

  // ==================== ANNOUNCEMENTS ====================
  announcements: {
    all: () => "announcements:all",
    active: () => "announcements:active",
    byBatch: (batchId: number) => `announcements:batch:${batchId}`,
  },

  // ==================== RESOURCES ====================
  resources: {
    videos: (batchId: number) => `resources:videos:${batchId}`,
    notes: (batchId: number) => `resources:notes:${batchId}`,
    materials: (batchId: number) => `resources:materials:${batchId}`,
  },

  // ==================== USER/AUTH ====================
  user: {
    byId: (id: number) => `user:${id}`,
    byEmail: (email: string) => `user:email:${email.toLowerCase()}`,
    permissions: (id: number) => `user:${id}:permissions`,
  },
};

/**
 * Cache invalidation patterns
 */
export const InvalidationPatterns = {
  allBatches: /^batches:/,
  allStudents: /^students:/,
  allAttendance: /^attendance:/,
  allAssignments: /^assignments:/,
  allFees: /^fees:/,
  allAnalytics: /^analytics:/,
  allAnnouncements: /^announcements:/,
  allResources: /^resources:/,

  // Specific patterns
  batchStudents: (batchId: number) => new RegExp(`^students:batch:${batchId}`),
  studentData: (studentId: number) =>
    new RegExp(`(students:${studentId}|attendance:student:${studentId}|fees:.*:${studentId})`),
};
```

---

## TTL Guidelines

### Recommended TTL Values

| Data Type | TTL (seconds) | Rationale |
|-----------|---------------|-----------|
| **Dashboard Stats** | 60-120 | Changes frequently, needs freshness |
| **Batch List** | 300 (5 min) | Rarely changes, moderate refresh |
| **Student List** | 300 (5 min) | Updates on enrollment |
| **Attendance Records** | 120 (2 min) | Active during marking |
| **Attendance Reports** | 600 (10 min) | Computed data, expensive query |
| **Assignment Slots** | 300 (5 min) | Moderate update frequency |
| **Submissions** | 60 (1 min) | Active during submission period |
| **Fee Structures** | 3600 (1 hr) | Rarely changes |
| **Fee Receipts** | 300 (5 min) | Updates on payment |
| **Announcements** | 300 (5 min) | Moderate frequency |
| **Analytics Trends** | 600 (10 min) | Expensive aggregations |
| **User Sessions** | 3600 (1 hr) | Token-based expiry |

### TTL Configuration

```typescript
export const TTL = {
  // Real-time data (1-2 minutes)
  REALTIME: 60,
  SHORT: 120,

  // Standard data (5 minutes)
  STANDARD: 300,

  // Moderate data (10 minutes)
  MODERATE: 600,

  // Long-lived data (30-60 minutes)
  LONG: 1800,
  EXTENDED: 3600,

  // Static data (24 hours)
  STATIC: 86400,
} as const;
```

---

## Cache Invalidation

### `src/cache/invalidation.ts`

```typescript
import { appCache, analyticsCache } from "./index";
import { CacheKeys, InvalidationPatterns } from "./keys";
import logger from "../utils/logger";

/**
 * Invalidation helpers for different entities
 */
export const CacheInvalidation = {
  /**
   * Invalidate all batch-related caches
   */
  batches: {
    onCreated: () => {
      appCache.del(CacheKeys.batches.all());
      appCache.del(CacheKeys.batches.count());
      analyticsCache.del(CacheKeys.analytics.batchDistribution());
      analyticsCache.del(CacheKeys.analytics.dashboard());
      logger.debug("Cache invalidated: batches:created");
    },

    onUpdated: (batchId: number) => {
      appCache.del(CacheKeys.batches.all());
      appCache.del(CacheKeys.batches.byId(batchId));
      appCache.del(CacheKeys.batches.withStudents(batchId));
      logger.debug(`Cache invalidated: batches:updated:${batchId}`);
    },

    onDeleted: (batchId: number) => {
      appCache.del(CacheKeys.batches.all());
      appCache.del(CacheKeys.batches.byId(batchId));
      appCache.del(CacheKeys.batches.count());
      appCache.delByPattern(`batch:${batchId}`);
      analyticsCache.del(CacheKeys.analytics.batchDistribution());
      analyticsCache.del(CacheKeys.analytics.dashboard());
      logger.debug(`Cache invalidated: batches:deleted:${batchId}`);
    },
  },

  /**
   * Invalidate student-related caches
   */
  students: {
    onEnrolled: (batchId: number) => {
      appCache.del(CacheKeys.students.all());
      appCache.del(CacheKeys.students.byBatch(batchId));
      appCache.del(CacheKeys.students.count());
      appCache.del(CacheKeys.students.countByBatch(batchId));
      appCache.del(CacheKeys.batches.withStudents(batchId));
      analyticsCache.del(CacheKeys.analytics.dashboard());
      analyticsCache.delByPattern("^analytics:enrollment");
      logger.debug(`Cache invalidated: students:enrolled:batch:${batchId}`);
    },

    onUpdated: (studentId: number, batchId: number) => {
      appCache.del(CacheKeys.students.byId(studentId));
      appCache.del(CacheKeys.students.byBatch(batchId));
      logger.debug(`Cache invalidated: students:updated:${studentId}`);
    },

    onDeleted: (studentId: number, batchId: number) => {
      appCache.del(CacheKeys.students.all());
      appCache.del(CacheKeys.students.byId(studentId));
      appCache.del(CacheKeys.students.byBatch(batchId));
      appCache.del(CacheKeys.students.count());
      analyticsCache.del(CacheKeys.analytics.dashboard());
      logger.debug(`Cache invalidated: students:deleted:${studentId}`);
    },
  },

  /**
   * Invalidate attendance-related caches
   */
  attendance: {
    onMarked: (batchId: number, studentId: number, date: string) => {
      appCache.del(CacheKeys.attendance.byBatchDate(batchId, date));
      appCache.del(CacheKeys.attendance.byStudent(studentId));
      appCache.del(CacheKeys.attendance.sheet(batchId));
      analyticsCache.del(CacheKeys.analytics.dashboard());
      analyticsCache.delByPattern("^analytics:attendance");
      analyticsCache.delByPattern("^analytics:monthly-attendance");
      logger.debug(`Cache invalidated: attendance:marked:${batchId}:${date}`);
    },

    onBulkMarked: (batchId: number, date: string) => {
      appCache.del(CacheKeys.attendance.byBatchDate(batchId, date));
      appCache.del(CacheKeys.attendance.sheet(batchId));
      appCache.delByPattern(`^attendance:student:`);
      analyticsCache.del(CacheKeys.analytics.dashboard());
      analyticsCache.delByPattern("^analytics:attendance");
      logger.debug(`Cache invalidated: attendance:bulk:${batchId}:${date}`);
    },
  },

  /**
   * Invalidate assignment-related caches
   */
  assignments: {
    onCreated: (batchId: number) => {
      appCache.del(CacheKeys.assignments.all());
      appCache.del(CacheKeys.assignments.byBatch(batchId));
      logger.debug(`Cache invalidated: assignments:created:batch:${batchId}`);
    },

    onSubmission: (slotId: number, studentId: number) => {
      appCache.del(CacheKeys.assignments.submissions(slotId));
      appCache.del(CacheKeys.assignments.studentSubmission(slotId, studentId));
      appCache.del(CacheKeys.assignments.stats(studentId));
      logger.debug(`Cache invalidated: assignments:submission:${slotId}`);
    },

    onReviewed: (slotId: number, studentId: number) => {
      appCache.del(CacheKeys.assignments.submissions(slotId));
      appCache.del(CacheKeys.assignments.studentSubmission(slotId, studentId));
      appCache.del(CacheKeys.assignments.stats(studentId));
      logger.debug(`Cache invalidated: assignments:reviewed:${slotId}`);
    },
  },

  /**
   * Invalidate fee-related caches
   */
  fees: {
    onReceiptCreated: (studentId: number, batchId: number) => {
      appCache.del(CacheKeys.fees.receipts(studentId));
      appCache.del(CacheKeys.fees.summary(studentId));
      appCache.del(CacheKeys.fees.batchSummary(batchId));
      logger.debug(`Cache invalidated: fees:receipt:${studentId}`);
    },

    onStructureUpdated: (batchId: number) => {
      appCache.del(CacheKeys.fees.structures(batchId));
      logger.debug(`Cache invalidated: fees:structure:${batchId}`);
    },
  },

  /**
   * Invalidate all analytics caches
   */
  analytics: {
    invalidateAll: () => {
      analyticsCache.flush();
      logger.debug("Cache invalidated: all analytics");
    },
  },

  /**
   * Global cache flush (use sparingly)
   */
  flushAll: () => {
    appCache.flush();
    analyticsCache.flush();
    logger.warn("All caches flushed");
  },
};
```

---

## Implementation Examples

### Example 1: Caching in Analytics Service

```typescript
// src/modules/dashboard/analytics/service.ts

import { analyticsCache } from "../../../cache";
import { CacheKeys } from "../../../cache/keys";
import { TTL } from "../../../cache/ttl";

class AnalyticsService {
  async getDashboardStats() {
    const cacheKey = CacheKeys.analytics.dashboard();

    // Try cache first
    return analyticsCache.getOrSet(
      cacheKey,
      async () => {
        // Expensive database query
        const [students, batches, todayAttendance] = await Promise.all([
          prisma.student.count({ where: { isDeleted: false } }),
          prisma.batch.count({ where: { isDeleted: false } }),
          this.getTodayAttendance(),
        ]);

        return {
          totalStudents: students,
          totalBatches: batches,
          todayAttendance,
          // ... other stats
        };
      },
      TTL.SHORT // 2 minutes
    );
  }

  async getEnrollmentTrends(months: number) {
    const cacheKey = CacheKeys.analytics.enrollmentTrends(months);

    return analyticsCache.getOrSet(
      cacheKey,
      async () => {
        // Complex aggregation query
        return this.calculateEnrollmentTrends(months);
      },
      TTL.MODERATE // 10 minutes
    );
  }
}
```

### Example 2: Caching in Student Service

```typescript
// src/modules/dashboard/student-enrollment/service.ts

import { appCache } from "../../../cache";
import { CacheKeys } from "../../../cache/keys";
import { CacheInvalidation } from "../../../cache/invalidation";
import { TTL } from "../../../cache/ttl";

class StudentEnrollmentService {
  async getAll(batchId?: number) {
    const cacheKey = batchId
      ? CacheKeys.students.byBatch(batchId)
      : CacheKeys.students.all();

    return appCache.getOrSet(
      cacheKey,
      async () => {
        return prisma.student.findMany({
          where: {
            isDeleted: false,
            ...(batchId && { batchId }),
          },
          orderBy: { createdAt: "desc" },
        });
      },
      TTL.STANDARD // 5 minutes
    );
  }

  async enrollSingle(data: EnrollStudentInput) {
    const student = await prisma.$transaction(async (tx) => {
      // ... enrollment logic
    });

    // Invalidate relevant caches
    CacheInvalidation.students.onEnrolled(data.batchId);

    return student;
  }

  async delete(id: number, deletedBy: string) {
    const student = await this.getById(id);

    await prisma.student.update({
      where: { id },
      data: { isDeleted: true, deletedBy },
    });

    // Invalidate caches
    CacheInvalidation.students.onDeleted(id, student.batchId!);
  }
}
```

### Example 3: Cache Middleware for Routes

```typescript
// src/cache/middleware.ts

import { Request, Response, NextFunction } from "express";
import { appCache } from "./index";
import logger from "../utils/logger";

interface CacheMiddlewareOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
}

export function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : `route:${req.originalUrl}`;

    const cached = appCache.get(key);
    if (cached) {
      logger.debug(`Route cache HIT: ${key}`);
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode === 200) {
        appCache.set(key, body, options.ttl);
        logger.debug(`Route cached: ${key}`);
      }
      return originalJson(body);
    };

    next();
  };
}

// Usage in routes:
// router.get("/dashboard-stats", cacheMiddleware({ ttl: 60 }), controller.getStats);
```

---

## Monitoring & Metrics

### Cache Stats Endpoint

```typescript
// src/modules/admin/cache.controller.ts

import { appCache, analyticsCache, sessionCache } from "../../cache";

class CacheController {
  getStats(req: Request, res: Response) {
    const stats = {
      app: appCache.getStats(),
      analytics: analyticsCache.getStats(),
      session: sessionCache.getStats(),
      timestamp: new Date().toISOString(),
    };

    return res.json({ success: true, data: stats });
  }

  flush(req: Request, res: Response) {
    const { cache } = req.query;

    switch (cache) {
      case "app":
        appCache.flush();
        break;
      case "analytics":
        analyticsCache.flush();
        break;
      case "session":
        sessionCache.flush();
        break;
      case "all":
        appCache.flush();
        analyticsCache.flush();
        sessionCache.flush();
        break;
      default:
        return res.status(400).json({ error: "Invalid cache name" });
    }

    return res.json({ success: true, message: `Cache ${cache} flushed` });
  }

  invalidatePattern(req: Request, res: Response) {
    const { pattern } = req.body;
    const deleted = appCache.delByPattern(pattern);
    return res.json({ success: true, deleted });
  }
}
```

### Logging Cache Performance

```typescript
// Add to logger configuration
const logCacheStats = () => {
  const stats = appCache.getStats();
  logger.info("Cache Stats", {
    hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
    hits: stats.hits,
    misses: stats.misses,
    keys: stats.keys,
  });
};

// Run every 5 minutes
setInterval(logCacheStats, 5 * 60 * 1000);
```

---

## Best Practices

### 1. Cache Key Naming

```
✅ Good: "students:batch:123"
✅ Good: "attendance:batch:5:date:2024-01-15"
❌ Bad:  "data_123"
❌ Bad:  "students"
```

### 2. Avoid Cache Stampede

```typescript
// Use mutex/lock for expensive operations
import { Mutex } from "async-mutex";

const mutex = new Mutex();

async function getExpensiveData(key: string) {
  const cached = cache.get(key);
  if (cached) return cached;

  // Acquire lock to prevent multiple DB queries
  const release = await mutex.acquire();
  try {
    // Double-check after acquiring lock
    const cachedAgain = cache.get(key);
    if (cachedAgain) return cachedAgain;

    const data = await fetchFromDB();
    cache.set(key, data);
    return data;
  } finally {
    release();
  }
}
```

### 3. Graceful Degradation

```typescript
async function getDataWithFallback(key: string, fetchFn: () => Promise<any>) {
  try {
    const cached = cache.get(key);
    if (cached) return cached;
  } catch (error) {
    logger.warn("Cache read failed, falling back to DB", { key, error });
  }

  const data = await fetchFn();

  try {
    cache.set(key, data);
  } catch (error) {
    logger.warn("Cache write failed", { key, error });
  }

  return data;
}
```

### 4. Don't Cache User-Specific Mutable Data

```typescript
// ❌ Don't cache if data changes per request
cache.set(`user:${userId}:session`, sessionData);

// ✅ Do cache if data is shared and stable
cache.set(`batches:all`, batchList);
```

### 5. Warm Cache on Startup

```typescript
// src/cache/warmup.ts

async function warmupCache() {
  logger.info("Warming up cache...");

  try {
    // Pre-load frequently accessed data
    await Promise.all([
      warmupBatches(),
      warmupAnalytics(),
      warmupAnnouncements(),
    ]);
    logger.info("Cache warmup complete");
  } catch (error) {
    logger.error("Cache warmup failed", error);
  }
}

async function warmupBatches() {
  const batches = await prisma.batch.findMany({ where: { isDeleted: false } });
  appCache.set(CacheKeys.batches.all(), batches, TTL.STANDARD);
}

// Call on app startup
app.listen(PORT, () => {
  warmupCache();
});
```

---

## Performance Comparison

### Before Caching

| Endpoint | Avg Response Time | DB Queries |
|----------|------------------|------------|
| GET /dashboard-stats | 450ms | 5 |
| GET /batches | 120ms | 1 |
| GET /students | 280ms | 2 |
| GET /attendance/report | 800ms | 8 |
| GET /analytics/trends | 650ms | 6 |

### After Caching

| Endpoint | Cache HIT | Cache MISS | Improvement |
|----------|-----------|------------|-------------|
| GET /dashboard-stats | 5ms | 450ms | 99% |
| GET /batches | 3ms | 120ms | 97% |
| GET /students | 4ms | 280ms | 98% |
| GET /attendance/report | 6ms | 800ms | 99% |
| GET /analytics/trends | 5ms | 650ms | 99% |

---

## Summary

This caching strategy provides:

1. **Reduced Database Load**: Cache frequently accessed data
2. **Faster Response Times**: Sub-10ms for cached responses
3. **Scalability**: Handle more concurrent requests
4. **Flexibility**: Different TTLs for different data types
5. **Maintainability**: Centralized cache management
6. **Observability**: Built-in stats and logging

### Implementation Priority

1. **High Priority**: Analytics, Dashboard Stats, Batch/Student Lists
2. **Medium Priority**: Attendance Records, Fee Summaries
3. **Low Priority**: Individual student lookups, User sessions

### Memory Considerations

- Default 10,000 keys max
- Average 1KB per cached item
- Estimated memory: ~10-50MB
- Monitor with `cache.getStats()`
