import { createSlice } from "@reduxjs/toolkit";

// Do not read from localStorage; notes are session-only in Redux.
const initialState = {
    byProblem: {}
};

const notesSlice = createSlice({
    name: "notes",
    initialState,
    reducers: {
        setNote: (state, action) => {
            const { problemId, content } = action.payload;
            state.byProblem[problemId] = content;
        },
        deleteNote: (state, action) => {
            delete state.byProblem[action.payload];
        },
        clearAllNotes: (state) => {
            state.byProblem = {};
        }
    }
});

export const { setNote, deleteNote, clearAllNotes } = notesSlice.actions;
export default notesSlice.reducer;
