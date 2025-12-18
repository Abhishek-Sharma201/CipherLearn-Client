import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
}

// Load token from localStorage on initial load
const loadTokenFromStorage = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

// Don't load from localStorage during SSR to prevent hydration mismatch
const initialState: AuthState = {
    user: null,
    token: null, // Will be loaded on client after hydration
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;

            // Persist token to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', action.payload.token);
            }
        },
        logoutLocal: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;

            // Clear token from localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
            }
        },
        updateUser: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
        },
        // Load token from localStorage after client hydration
        rehydrateAuth: (state) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    state.token = token;
                    state.isAuthenticated = true;
                }
            }
        },
    },
});

export const { setCredentials, logoutLocal, updateUser, rehydrateAuth } = authSlice.actions;
export default authSlice.reducer;
