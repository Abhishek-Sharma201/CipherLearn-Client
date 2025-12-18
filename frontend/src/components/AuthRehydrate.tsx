"use client"

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { rehydrateAuth } from '@/redux/slices/auth/authSlice';

export function AuthRehydrate() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Rehydrate auth state from localStorage after client-side hydration
        dispatch(rehydrateAuth());
    }, [dispatch]);

    return null; // This component doesn't render anything
}
