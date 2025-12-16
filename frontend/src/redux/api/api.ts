import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { tagTypes } from '../constants/tags';
import { RootState } from '../store';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api', // Fallback to local
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.auth?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Auth', 'Students', 'Batches', 'Announcements', 'Attendance', 'Fees', 'Notes', 'Videos', 'Dashboard'],
    endpoints: () => ({}),
});
