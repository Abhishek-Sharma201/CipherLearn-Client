import { api, ApiResponse } from '../../api/api';
import { Teacher } from '@/types';

export interface CreateTeacherInput {
    name: string;
    email: string;
}

export interface UpdateTeacherInput {
    name?: string;
    email?: string;
}

export const teachersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getTeachers: builder.query<Teacher[], void>({
            query: () => '/dashboard/teachers',
            transformResponse: (response: ApiResponse<Teacher[]>): Teacher[] => {
                return response.data || [];
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Teachers' as const, id })),
                        { type: 'Teachers', id: 'LIST' }
                    ]
                    : [{ type: 'Teachers', id: 'LIST' }],
        }),

        createTeacher: builder.mutation<ApiResponse<Teacher>, CreateTeacherInput>({
            query: (data) => ({
                url: '/dashboard/teachers',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'Teachers', id: 'LIST' }],
        }),

        updateTeacher: builder.mutation<ApiResponse<Teacher>, { id: number; data: UpdateTeacherInput }>({
            query: ({ id, data }) => ({
                url: `/dashboard/teachers/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Teachers', id },
                { type: 'Teachers', id: 'LIST' }
            ],
        }),

        deleteTeacher: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `/dashboard/teachers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Teachers', id },
                { type: 'Teachers', id: 'LIST' }
            ],
        }),
    }),
});

export const {
    useGetTeachersQuery,
    useCreateTeacherMutation,
    useUpdateTeacherMutation,
    useDeleteTeacherMutation,
} = teachersApi;
