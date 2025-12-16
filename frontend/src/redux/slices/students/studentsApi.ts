import { api } from '../../api/api';

export const studentsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        enrollStudent: builder.mutation({
            query: (studentData) => ({
                url: '/dashboard/student-enrollment/enroll',
                method: 'POST',
                body: studentData,
            }),
            invalidatesTags: ['Students'],
        }),
        enrollStudentCsv: builder.mutation({
            query: (formData) => ({
                url: '/dashboard/student-enrollment/enroll-with-csv',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Students'],
        }),
        getStudents: builder.query({
            query: () => '/dashboard/student-enrollment/students',
            providesTags: ['Students'],
        }),
        deleteStudent: builder.mutation({
            query: (id) => ({
                url: `/dashboard/student-enrollment/students/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Students'],
        }),
    }),
});

export const {
    useEnrollStudentMutation,
    useEnrollStudentCsvMutation,
    useGetStudentsQuery,
    useDeleteStudentMutation,
} = studentsApi;
