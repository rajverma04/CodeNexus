import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../authSlice";
import chatReducer from "../chatSlice";
import notesReducer from "../notesSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        notes: notesReducer
    }
})