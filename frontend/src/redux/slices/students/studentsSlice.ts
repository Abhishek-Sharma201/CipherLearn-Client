import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedStudentId: null as number | null,
    isEditModalOpen: false,
};

const studentsSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {
        setSelectedStudentId: (state, action) => {
            state.selectedStudentId = action.payload;
        },
        openEditModal: (state) => {
            state.isEditModalOpen = true;
        },
        closeEditModal: (state) => {
            state.isEditModalOpen = false;
        },
    },
});

export const { setSelectedStudentId, openEditModal, closeEditModal } = studentsSlice.actions;
export default studentsSlice.reducer;
