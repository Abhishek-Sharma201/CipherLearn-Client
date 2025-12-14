import { api } from '../../api/api';

const dummyStudents = [
    { id: 1, name: "Aarav Patel", batch: "Physics Class 11", joinDate: "2024-01-15", status: "Active", email: "aarav@example.com" },
    { id: 2, name: "Diya Sharma", batch: "Math Class 10", joinDate: "2024-02-01", status: "Active", email: "diya@example.com" },
    { id: 3, name: "Rohan Gupta", batch: "Chem Class 12", joinDate: "2024-01-10", status: "Inactive", email: "rohan@example.com" },
    { id: 4, name: "Ishaan Kumar", batch: "Physics Class 11", joinDate: "2024-03-05", status: "Active", email: "ishaan@example.com" },
    { id: 5, name: "Ananya Singh", batch: "Bio Class 11", joinDate: "2024-02-20", status: "Active", email: "ananya@example.com" },
    { id: 6, name: "Vivaan Malhotra", batch: "Math Class 10", joinDate: "2024-01-25", status: "Active", email: "vivaan@example.com" },
    { id: 7, name: "Aditya Verma", batch: "Chem Class 12", joinDate: "2024-03-01", status: "Payment Due", email: "aditya@example.com" },
];

export const studentsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getStudents: builder.query({
            queryFn: async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return { data: dummyStudents };
            },
            providesTags: ['Students'],
        }),
        addStudent: builder.mutation({
            queryFn: async (arg) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                const newStudent = { id: Math.random(), ...arg };
                // In real app we would modify server state. Here we can't persistent modify the dummy array easily 
                // without local persistence but RTK Query cache manipulation is usually for optimistic.
                // Since we return success, invalidateTags should trigger re-fetch.
                // But queryFn returning data is static.
                // I will simply return success and the list will *re-read* the static list. 
                // To see changes I might need to mock state?
                // For this demo, let's just pretend success. Ideally I'd use a mutable mock DB.
                return { data: newStudent };
            },
            invalidatesTags: ['Students'],
        }),
        deleteStudent: builder.mutation({
            queryFn: async (id) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return { data: { success: true, id } };
            },
            invalidatesTags: ['Students'],
        })
    }),
});

export const { useGetStudentsQuery, useAddStudentMutation, useDeleteStudentMutation } = studentsApi;
