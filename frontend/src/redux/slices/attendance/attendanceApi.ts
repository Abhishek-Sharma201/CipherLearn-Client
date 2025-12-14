import { api } from '../../api/api';

const dummyAttendance = [
    { id: 1, name: "Aarav Patel", status: "Present" },
    { id: 2, name: "Diya Sharma", status: "Present" },
    { id: 3, name: "Rohan Gupta", status: "Absent" },
    { id: 4, name: "Ishaan Kumar", status: "Present" },
    { id: 5, name: "Ananya Singh", status: "Present" },
];

export const attendanceApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAttendance: builder.query({
            queryFn: async ({ batch, date }) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return { data: dummyAttendance }; // Return same dummy data for any batch/date
            },
            providesTags: ['Attendance'],
        }),
        markAttendance: builder.mutation({
            queryFn: async ({ id, status }) => {
                await new Promise(resolve => setTimeout(resolve, 200));
                return { data: { success: true } };
            },
            invalidatesTags: ['Attendance'],
        }),
        saveBatchAttendance: builder.mutation({
            queryFn: async (payload) => {
                await new Promise(resolve => setTimeout(resolve, 800));
                return { data: { success: true, message: "Attendance saved" } };
            },
            invalidatesTags: ['Attendance', 'Dashboard'], // Dashboard might show recent activity
        })
    }),
});

export const { useGetAttendanceQuery, useMarkAttendanceMutation, useSaveBatchAttendanceMutation } = attendanceApi;
