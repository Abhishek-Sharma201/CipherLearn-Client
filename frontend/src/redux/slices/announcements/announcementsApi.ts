import { api } from '../../api/api';

const dummyAnnouncements = [
    { id: 1, title: "Physics Class Rescheduled", content: "The Physics class for batch 11 scheduled for tomorrow is moved to 10:00 AM.", dae: "2024-04-10", pinned: true, author: "Admin" },
    { id: 2, title: "Fee Submission Deadline", content: "Last date to submit fees for this month is 15th April.", dae: "2024-04-05", pinned: true, author: "Admin" },
    { id: 3, title: "New Biology Teacher", content: "We are happy to welcome Ms. Priya to our faculty.", dae: "2024-04-01", pinned: false, author: "Admin" },
    { id: 4, title: "Holiday Notice", content: "Institute will remain closed on account of Holi.", dae: "2024-03-20", pinned: false, author: "Admin" },
];

export const announcementsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAnnouncements: builder.query({
            queryFn: async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return { data: dummyAnnouncements };
            },
            providesTags: ['Announcements'],
        }),
        createAnnouncement: builder.mutation({
            queryFn: async (payload) => {
                await new Promise(resolve => setTimeout(resolve, 800));
                return { data: { success: true } };
            },
            invalidatesTags: ['Announcements']
        })
    }),
});

export const { useGetAnnouncementsQuery, useCreateAnnouncementMutation } = announcementsApi;
