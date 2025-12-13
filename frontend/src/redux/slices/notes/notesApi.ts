import { api } from '../../api/api';

const dummyNotes = [
    { id: 1, title: "Kinematics Notes", batch: "Physics Class 11", size: "2.4 MB", downloads: 24, date: "2024-04-10" },
    { id: 2, title: "Algebra Formulas", batch: "Math Class 10", size: "1.2 MB", downloads: 18, date: "2024-04-09" },
    { id: 3, title: "Organic Chem Reaction Mechanisms", batch: "Chem Class 12", size: "3.5 MB", downloads: 30, date: "2024-04-08" },
    { id: 4, title: "Cell Structure Diagram", batch: "Bio Class 11", size: "1.8 MB", downloads: 20, date: "2024-04-07" },
];

export const notesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getNotes: builder.query({
            queryFn: async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return { data: dummyNotes };
            },
            providesTags: ['Notes'],
        }),
        uploadNote: builder.mutation({
            queryFn: async (payload) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { data: { success: true } };
            },
            invalidatesTags: ['Notes']
        }),
        deleteNote: builder.mutation({
            queryFn: async (id) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return { data: { success: true } };
            },
            invalidatesTags: ['Notes']
        })
    }),
});

export const { useGetNotesQuery, useUploadNoteMutation, useDeleteNoteMutation } = notesApi;
