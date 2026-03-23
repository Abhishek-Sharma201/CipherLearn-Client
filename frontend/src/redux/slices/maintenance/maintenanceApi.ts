import { api } from '../../api/api';

// ── Types ──────────────────────────────────────────────────

export interface SeedStudent {
    name: string;
    email: string;
    password: string;
    batchName: string;
}

export interface SeedResult {
    summary: Record<string, number>;
    students: SeedStudent[];
}

export interface HealthResult {
    total: number;
    passed: number;
    failed: number;
    results: { method: string; path: string; module: string; status: number; time: number; passed: boolean; error?: string }[];
}

export interface ValidationResult {
    total: number;
    passed: number;
    failed: number;
    results: { method: string; path: string; module: string; status: number; passed: boolean; desc: string; serverMessage?: string }[];
}

export interface SecurityResult {
    total: number;
    passed: number;
    failed: number;
    results: { test: string; path: string; module: string; status: number; passed: boolean; expected: string }[];
}

export interface DbIntegrityResult {
    total: number;
    issues: number;
    checks: { name: string; table: string; count: number; passed: boolean; detail: string }[];
}

export interface LoadTestResult {
    endpoint: string;
    totalRequests: number;
    successful: number;
    failed: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
    p95Time: number;
    requestsPerSecond: number;
    statusCodeBreakdown: Record<number, number>;
}

export interface EndpointInfo {
    method: string;
    path: string;
    module: string;
}

// ── API Slice ──────────────────────────────────────────────

export const maintenanceApi = api.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        maintenanceAuth: builder.mutation<{ success: boolean }, { password: string }>({
            query: (body) => ({ url: '/dashboard/maintenance/auth', method: 'POST', body }),
        }),
        maintenanceStatus: builder.query<Record<string, number>, void>({
            query: () => '/dashboard/maintenance/status',
            transformResponse: (r: { data: Record<string, number> }) => r.data,
        }),
        maintenanceSeed: builder.mutation<{ data: SeedResult }, { password: string; count: number; batchId?: number }>({
            query: (body) => ({ url: '/dashboard/maintenance/seed', method: 'POST', body }),
        }),
        maintenanceCleanup: builder.mutation<{ data: Record<string, number> }, { password: string }>({
            query: (body) => ({ url: '/dashboard/maintenance/cleanup', method: 'DELETE', body }),
        }),
        maintenanceApiHealth: builder.mutation<{ data: HealthResult }, { baseUrl: string; token: string }>({
            query: (body) => ({ url: '/dashboard/maintenance/api-health', method: 'POST', body }),
        }),
        maintenanceValidation: builder.mutation<{ data: ValidationResult }, { baseUrl: string; token: string }>({
            query: (body) => ({ url: '/dashboard/maintenance/validation-audit', method: 'POST', body }),
        }),
        maintenanceSecurity: builder.mutation<{ data: SecurityResult }, { baseUrl: string; token: string }>({
            query: (body) => ({ url: '/dashboard/maintenance/security-audit', method: 'POST', body }),
        }),
        maintenanceDbIntegrity: builder.query<DbIntegrityResult, void>({
            query: () => '/dashboard/maintenance/db-integrity',
            transformResponse: (r: { data: DbIntegrityResult }) => r.data,
        }),
        maintenanceLoadTest: builder.mutation<{ data: LoadTestResult }, { baseUrl: string; token: string; endpoint: string; method?: string; concurrency?: number; iterations?: number }>({
            query: (body) => ({ url: '/dashboard/maintenance/load-test', method: 'POST', body }),
        }),
        maintenanceEndpoints: builder.query<EndpointInfo[], void>({
            query: () => '/dashboard/maintenance/endpoints',
            transformResponse: (r: { data: EndpointInfo[] }) => r.data,
        }),
    }),
});

export const {
    useMaintenanceAuthMutation,
    useMaintenanceStatusQuery,
    useMaintenanceSeedMutation,
    useMaintenanceCleanupMutation,
    useMaintenanceApiHealthMutation,
    useMaintenanceValidationMutation,
    useMaintenanceSecurityMutation,
    useMaintenanceDbIntegrityQuery,
    useMaintenanceLoadTestMutation,
    useMaintenanceEndpointsQuery,
} = maintenanceApi;
