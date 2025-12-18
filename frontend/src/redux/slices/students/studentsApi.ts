import { api } from '../../api/api';

export const studentsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getStudents: builder.query({
            query: (batchId) => ({
                url: `/dashboard/batches/${batchId}`,
                method: 'GET',
            }),
            providesTags: ['Students'],
            // Transform response to extract students array from batch data
            transformResponse: (response: any) => {
                return response?.students || [];
            },
        }),
        enrollStudent: builder.mutation({
            query: (studentData) => ({
                url: '/dashboard/student-enrollment/enroll',
                method: 'POST',
                body: studentData,
            }),
            invalidatesTags: ['Students', 'Batches'],
        }),
        enrollStudentsWithCSV: builder.mutation({
            query: (formData) => ({
                url: '/dashboard/student-enrollment/enroll-with-csv',
                method: 'POST',
                body: formData,
                // FormData will be sent as multipart/form-data automatically
            }),
            invalidatesTags: ['Students', 'Batches'],
        }),
        deleteStudent: builder.mutation({
            query: (id) => ({
                url: `/dashboard/students/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Students', 'Batches'],
        }),
    }),
});

export const {
    useGetStudentsQuery,
    useEnrollStudentMutation,
    useEnrollStudentsWithCSVMutation,
    useDeleteStudentMutation,
} = studentsApi;
