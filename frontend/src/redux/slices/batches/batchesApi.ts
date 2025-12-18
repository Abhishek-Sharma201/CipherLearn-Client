import { api } from '../../api/api';

export const batchesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getBatches: builder.query({
            query: () => ({
                url: '/dashboard/batches',
                method: 'GET',
            }),
            providesTags: ['Batches'],
        }),
        createBatch: builder.mutation({
            query: (payload) => ({
                url: '/dashboard/batches',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Batches'],
        }),
        updateBatch: builder.mutation({
            query: ({ id, ...payload }) => ({
                url: `/dashboard/batches/${id}`,
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: ['Batches'],
        }),
        deleteBatch: builder.mutation({
            query: (id) => ({
                url: `/dashboard/batches/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Batches'],
        }),
        createDraftBatch: builder.mutation({
            query: (payload) => ({
                url: '/dashboard/batches/draft',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Batches'],
        }),
        getDraftBatches: builder.query({
            query: () => ({
                url: '/dashboard/batches/drafts',
                method: 'GET',
            }),
            providesTags: ['Batches'],
        }),
    }),
});

export const {
    useGetBatchesQuery,
    useCreateBatchMutation,
    useUpdateBatchMutation,
    useDeleteBatchMutation,
    useCreateDraftBatchMutation,
    useGetDraftBatchesQuery,
} = batchesApi;
