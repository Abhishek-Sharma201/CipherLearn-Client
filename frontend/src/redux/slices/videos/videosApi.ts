import { api } from '../../api/api';

const dummyVideos = [
    { id: 1, title: "Kinematics - Lecture 1", batch: "Physics Class 11", duration: "45:00", views: 24, date: "2024-04-10" },
    { id: 2, title: "Algebra Basics", batch: "Math Class 10", duration: "50:00", views: 18, date: "2024-04-09" },
    { id: 3, title: "Organic Chemistry Intro", batch: "Chem Class 12", duration: "55:00", views: 30, date: "2024-04-08" },
    { id: 4, title: "Cell Biology", batch: "Bio Class 11", duration: "40:00", views: 20, date: "2024-04-07" },
];

export const videosApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getVideos: builder.query({
            queryFn: async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return { data: dummyVideos };
            },
            providesTags: ['Videos'],
        }),
        uploadVideo: builder.mutation({
            queryFn: async (payload) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { data: { success: true } };
            },
            invalidatesTags: ['Videos']
        })
    }),
});

export const { useGetVideosQuery, useUploadVideoMutation } = videosApi;
