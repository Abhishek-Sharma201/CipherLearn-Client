import { api, ApiResponse } from '../../api/api';
import { Announcement } from '../announcements/announcementsApi';

// Student profile types for app side
export interface AppStudentProfile {
    id: number;
    firstname: string;
    middlename: string | null;
    lastname: string;
    fullname: string;
    email: string;
    dob: string | null;
    address: string | null;
    batch: {
        id: number;
        name: string;
        timings: {
            days: string[];
            time: string;
        } | null;
    } | null;
}

// App API endpoints for student-facing features
export const appApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get student's own profile (app side)
        getAppProfile: builder.query<AppStudentProfile, void>({
            query: () => '/app/profile',
            transformResponse: (response: ApiResponse<AppStudentProfile>): AppStudentProfile => {
                if (!response.data) {
                    throw new Error("Profile data not found");
                }
                return response.data;
            },
            providesTags: ['Students'],
        }),

        // Get active announcements for students (app side)
        getAppAnnouncements: builder.query<Announcement[], number | void>({
            query: (limit) => {
                const queryParams = limit ? `?limit=${limit}` : '';
                return `/app/announcements${queryParams}`;
            },
            transformResponse: (response: ApiResponse<Announcement[]>): Announcement[] => {
                return response.data || [];
            },
            providesTags: [{ type: 'Announcements', id: 'APP' }],
        }),
    }),
});

export const {
    useGetAppProfileQuery,
    useGetAppAnnouncementsQuery,
} = appApi;
