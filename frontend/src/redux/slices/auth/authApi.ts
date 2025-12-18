import { api } from '../../api/api';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        updateProfile: builder.mutation({
            query: (data) => ({
                url: '/auth/profile',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),
        signup: builder.mutation({
            query: (userData) => ({
                url: '/auth/signup',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['Auth'],
        }),
    }),
});

export const { useLoginMutation, useSignupMutation, useUpdateProfileMutation } = authApi;
