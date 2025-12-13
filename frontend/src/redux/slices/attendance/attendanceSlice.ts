import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentBatch: 'Physics Class 11',
    date: new Date().toISOString().split('T')[0],
    view: 'mark', // mark, history, report
};

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        setBatch: (state, action) => {
            state.currentBatch = action.payload;
        },
        setDate: (state, action) => {
            state.date = action.payload;
        },
        setView: (state, action) => {
            state.view = action.payload;
        }
    },
});

export const { setBatch, setDate, setView } = attendanceSlice.actions;
export default attendanceSlice.reducer;
