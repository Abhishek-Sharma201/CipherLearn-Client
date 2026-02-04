import { api, ApiResponse } from '../../api/api';
import {
    Student,
    StudentProfile,
    StudentsApiResponse,
    EnrollStudentInput,
    CSVPreviewData,
    CSVImportResult
} from '@/types';

// Local types for update input if not in central types
export interface UpdateStudentInput {
    firstname?: string;
    middlename?: string;
    lastname?: string;
    email?: string;
    dob?: string;
    address?: string;
    batchId?: number;
}

export const studentsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all students (optionally by batch)
        getStudents: builder.query<Student[], number | void>({
            query: (batchId) => {
                if (batchId) {
                    return `/dashboard/student-enrollment/students/${batchId}`;
                }
                return '/dashboard/student-enrollment/students';
            },
            transformResponse: (response: StudentsApiResponse | { students?: Student[] } | Student[]): Student[] => {
                if (Array.isArray(response)) {
                    return response;
                }
                if ('data' in response && Array.isArray(response.data)) {
                    return response.data;
                }
                if ('students' in response && Array.isArray(response.students)) {
                    return response.students;
                }
                return [];
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Students' as const, id })),
                        { type: 'Students', id: 'LIST' }
                    ]
                    : [{ type: 'Students', id: 'LIST' }],
        }),

        // Get single student
        getStudentById: builder.query<Student, number>({
            query: (id) => `/dashboard/student-enrollment/student/${id}`,
            transformResponse: (response: ApiResponse<Student>): Student => {
                if (!response.data) {
                    throw new Error("Student data not found in response");
                }
                return response.data;
            },
            providesTags: (_result, _error, id) => [{ type: 'Students', id }],
        }),

        // Enroll single student
        enrollStudent: builder.mutation<ApiResponse<Student>, EnrollStudentInput>({
            query: (data) => ({
                url: '/dashboard/student-enrollment/enroll',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'Students', id: 'LIST' }, 'Dashboard', 'Batches'],
        }),

        // Update student with optimistic update
        updateStudent: builder.mutation<ApiResponse<Student>, { id: number; data: UpdateStudentInput }>({
            query: ({ id, data }) => ({
                url: `/dashboard/student-enrollment/student/${id}`,
                method: 'PUT',
                body: data,
            }),
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                // Optimistic update for the list
                const patchResult = dispatch(
                    studentsApi.util.updateQueryData('getStudents', undefined, (draft) => {
                        const student = draft.find(s => s.id === id);
                        if (student) {
                            Object.assign(student, {
                                firstname: data.firstname ?? student.firstname,
                                lastname: data.lastname ?? student.lastname,
                                middlename: data.middlename ?? student.middlename,
                                email: data.email ?? student.email,
                            });
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Students', id },
                { type: 'Students', id: 'LIST' }
            ],
        }),

        // Delete student with optimistic update
        deleteStudent: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `/dashboard/student-enrollment/student/${id}`,
                method: 'DELETE',
            }),
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    studentsApi.util.updateQueryData('getStudents', undefined, (draft) => {
                        const index = draft.findIndex(s => s.id === id);
                        if (index !== -1) {
                            draft.splice(index, 1);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (_result, _error, id) => [
                { type: 'Students', id },
                { type: 'Students', id: 'LIST' },
                'Dashboard',
                'Batches'
            ],
        }),

        // Preview CSV import
        previewCSV: builder.mutation<CSVPreviewData, FormData>({
            query: (formData) => ({
                url: '/dashboard/student-enrollment/csv/preview',
                method: 'POST',
                body: formData,
            }),
            transformResponse: (response: ApiResponse<CSVPreviewData>): CSVPreviewData => {
                return response.data!;
            },
        }),

        // Import students from CSV
        importCSV: builder.mutation<CSVImportResult, FormData>({
            query: (formData) => ({
                url: '/dashboard/student-enrollment/csv/import',
                method: 'POST',
                body: formData,
            }),
            transformResponse: (response: ApiResponse<CSVImportResult>): CSVImportResult => {
                return response.data!;
            },
            invalidatesTags: [{ type: 'Students', id: 'LIST' }, 'Dashboard', 'Batches'],
        }),

        // Download CSV template
        downloadCSVTemplate: builder.query<string, void>({
            query: () => ({
                url: '/dashboard/student-enrollment/csv/template',
                responseHandler: (response: Response) => response.text(),
            }),
        }),

        // Get current user's student profile (for student users)
        getMyStudentProfile: builder.query<StudentProfile, void>({
            query: () => '/dashboard/student-enrollment/my-profile',
            transformResponse: (response: ApiResponse<StudentProfile>): StudentProfile => {
                if (!response.data) {
                    throw new Error("Student profile not found");
                }
                return response.data;
            },
            providesTags: ['Students'],
        }),

        // Get soft-deleted students
        getDeletedStudents: builder.query<Student[], void>({
            query: () => '/dashboard/student-enrollment/deleted',
            transformResponse: (response: ApiResponse<Student[]>): Student[] => {
                return response.data || [];
            },
            providesTags: [{ type: 'Students', id: 'DELETED' }],
        }),

        // Restore soft-deleted students
        restoreStudents: builder.mutation<ApiResponse<{ restored: number }>, number[]>({
            query: (ids) => ({
                url: '/dashboard/student-enrollment/restore',
                method: 'PUT',
                body: { ids },
            }),
            invalidatesTags: [
                { type: 'Students', id: 'LIST' },
                { type: 'Students', id: 'DELETED' },
                'Dashboard',
                'Batches'
            ],
        }),

        // DANGER ZONE - Hard Delete Operations
        hardDeleteStudent: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `/dashboard/student-enrollment/hard-delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'Students', id: 'LIST' },
                { type: 'Students', id: 'DELETED' },
                'Dashboard',
                'Batches',
                'Attendance'
            ],
        }),

        hardDeleteManyStudents: builder.mutation<ApiResponse<{ deleted: number }>, number[]>({
            query: (ids) => ({
                url: '/dashboard/student-enrollment/hard-delete-many',
                method: 'DELETE',
                body: { ids },
            }),
            invalidatesTags: [
                { type: 'Students', id: 'LIST' },
                { type: 'Students', id: 'DELETED' },
                'Dashboard',
                'Batches',
                'Attendance'
            ],
        }),

        purgeDeletedStudents: builder.mutation<ApiResponse<{ deleted: number }>, void>({
            query: () => ({
                url: '/dashboard/student-enrollment/purge-deleted',
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'Students', id: 'LIST' },
                { type: 'Students', id: 'DELETED' },
                'Dashboard',
                'Batches',
                'Attendance'
            ],
        }),
    }),
});

export const {
    useGetStudentsQuery,
    useGetStudentByIdQuery,
    useEnrollStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
    usePreviewCSVMutation,
    useImportCSVMutation,
    useLazyDownloadCSVTemplateQuery,
    useGetMyStudentProfileQuery,
    useGetDeletedStudentsQuery,
    useRestoreStudentsMutation,
    useHardDeleteStudentMutation,
    useHardDeleteManyStudentsMutation,
    usePurgeDeletedStudentsMutation,
} = studentsApi;
