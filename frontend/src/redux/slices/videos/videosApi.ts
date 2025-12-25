import { api } from '../../api/api';

export const videosApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getVideos: builder.query({
            query: (batchId) => ({
                url: `/dashboard/youtube-videos?batchId=${batchId || ''}`,
                method: 'GET',
            }),
            providesTags: ['Videos'],
            // Backend returns { success: true, data: [...] }
            transformResponse: (response: any) => response.data || [],
        }),
        uploadVideo: builder.mutation({
            query: (payload) => ({
                url: '/dashboard/youtube-videos/upload',
                method: 'POST',
                body: payload, // { title, description, category, visibility, url, batchId }
            }),
            invalidatesTags: ['Videos'],
        }),
        updateVideo: builder.mutation({
            query: ({ videoId, ...payload }) => ({
                url: `/dashboard/youtube-videos/${videoId}`,
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: ['Videos'],
        }),
        deleteVideo: builder.mutation({
            query: (videoId) => ({
                url: `/dashboard/youtube-videos/${videoId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Videos'],
        }),
    }),
});

export const {
    useGetVideosQuery,
    useUploadVideoMutation,
    useUpdateVideoMutation,
    useDeleteVideoMutation,
} = videosApi;
