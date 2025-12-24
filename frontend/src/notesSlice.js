import { createSlice } from "@reduxjs/toolkit";

// Load initial notes from localStorage so users keep drafts between sessions.
const loadInitialNotes = () => {
    if (typeof localStorage === "undefined") return {};
    try {
        const stored = localStorage.getItem("cn_notes");
        return stored ? JSON.parse(stored) : {};
    } catch (err) {
        console.warn("Failed to load notes from storage", err);
        return {};
    }
};

const initialState = {
    byProblem: loadInitialNotes()
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
