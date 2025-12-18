import { api } from '../../api/api';

export const attendanceApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createAttendanceSheet: builder.mutation({
            query: (payload) => ({
                url: '/dashboard/attendance/create-attendance-sheet',
                method: 'POST',
                body: payload, // { batchId, month, year }
            }),
            invalidatesTags: ['Attendance'],
        }),
        getAttendance: builder.query({
            query: (batchId) => ({
                url: `/dashboard/attendance/batch-attendance-sheet/${batchId}`,
                method: 'GET',
            }),
            providesTags: ['Attendance'],
        }),
        markAttendance: builder.mutation({
            query: (payload) => ({
                url: '/dashboard/attendance/mark-attendance',
                method: 'POST',
                body: payload, // { studentId, batchId, date, markedBy, markedById, method, status }
            }),
            invalidatesTags: ['Attendance'],
        }),
        getStudentAttendanceMatrix: builder.query({
            query: (studentId) => ({
                url: `/dashboard/attendance/student-attendance-matrix/${studentId}`,
                method: 'GET',
            }),
            providesTags: ['Attendance'],
        }),
        saveBatchAttendance: builder.mutation({
            query: (payload) => ({
                url: '/dashboard/attendance/mark-attendance',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Attendance', 'Dashboard'],
        }),
    }),
});

export const {
    useCreateAttendanceSheetMutation,
    useGetAttendanceQuery,
    useMarkAttendanceMutation,
    useGetStudentAttendanceMatrixQuery,
    useSaveBatchAttendanceMutation,
} = attendanceApi;
