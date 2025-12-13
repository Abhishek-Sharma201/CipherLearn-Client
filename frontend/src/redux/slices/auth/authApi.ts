import { api } from '../../api/api';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            // Mocking login response with queryFn
            queryFn: async (arg) => {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock success
                if (arg.email && arg.password) {
                    return {
                        data: {
                            user: {
                                name: "Demo User",
                                email: arg.email,
                                role: "Admin"
                            },
                            token: "mock-jwt-token-xyz-123"
                        }
                    }
                }
                return { error: { status: 401, data: { message: "Invalid credentials" } } }
            },
            invalidatesTags: ['Auth'],
        }),
        signup: builder.mutation({
            queryFn: async (arg) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return {
                    data: {
                        message: "User registered successfully",
                        user: { name: arg.name, email: arg.email }
                    }
                }
            }
        }),
        me: builder.query({
            providesTags: ['Auth'],
            // Mock implementation if needed, but Login usually sets the state. 
            // For now let's leave it as a real endpoint placeholder or mock it too.
            queryFn: async () => {
                // Simulate session check
                // In a real app this hits the server.
                return { data: { name: "Demo User", email: "user@example.com", role: "Admin" } }
            }
        }),
        logoutServer: builder.mutation({
            invalidatesTags: ['Auth'],
            queryFn: async () => {
                return { data: { success: true } }
            }
        }),
    }),
});

export const { useLoginMutation, useSignupMutation, useMeQuery, useLogoutServerMutation } = authApi;
