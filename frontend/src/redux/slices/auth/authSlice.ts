import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: { name: string; email: string; role: string } | null;
    token: string | null;
    status: 'idle' | 'authenticated' | 'unauthenticated';
}

const initialState: AuthState = {
    user: null,
    token: null,
    status: 'idle',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.status = 'authenticated';
        },
        logoutLocal: (state) => {
            state.user = null;
            state.token = null;
            state.status = 'unauthenticated';
        },
    },
});

export const { setCredentials, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
