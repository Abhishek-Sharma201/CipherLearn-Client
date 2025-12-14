import { api } from '../../api/api';

const dummyFees = [
    { id: 1, name: "Aarav Patel", batch: "Physics Class 11", amount: 5000, status: "Paid", date: "2024-04-01", progress: 100 },
    { id: 2, name: "Diya Sharma", batch: "Math Class 10", amount: 4500, status: "Pending", date: "2024-04-05", progress: 60 },
    { id: 3, name: "Rohan Gupta", batch: "Chem Class 12", amount: 5500, status: "Overdue", date: "2024-03-25", progress: 20 },
    { id: 4, name: "Ishaan Kumar", batch: "Physics Class 11", amount: 5000, status: "Paid", date: "2024-04-02", progress: 100 },
    { id: 5, name: "Ananya Singh", batch: "Bio Class 11", amount: 4800, status: "Pending", date: "2024-04-10", progress: 40 },
];

export const feesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getFees: builder.query({
            queryFn: async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return { data: dummyFees };
            },
            providesTags: ['Fees'],
        }),
        sendReminder: builder.mutation({
            queryFn: async (id) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return { data: { success: true, message: "Reminder sent" } };
            }
        })
    }),
});

export const { useGetFeesQuery, useSendReminderMutation } = feesApi;
