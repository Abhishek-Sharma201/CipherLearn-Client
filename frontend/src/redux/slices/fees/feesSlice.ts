import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    view: 'table',
};

const feesSlice = createSlice({
    name: 'fees',
    initialState,
    reducers: {
        toggleView: (state) => {
            state.view = state.view === 'table' ? 'grid' : 'table';
        },
    },
});

export const { toggleView } = feesSlice.actions;
export default feesSlice.reducer;
