import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [
        { role: "model", parts: [{ text: "Hi, How are you?" }] },
        { role: "user", parts: [{ text: "I am good" }] },
    ],
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        clearChat: (state) => {
            state.messages = initialState.messages;
        },
    },
});

export const { addMessage, setMessages, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
