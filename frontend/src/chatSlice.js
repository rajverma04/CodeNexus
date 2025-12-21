import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    messages: [],
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
        initializeChat: (state, action) => {
            const user = action.payload;
            const greeting = user?.firstName
                ? `Hi ${user.firstName}, I'm your AI assistant. How can I help you with this problem?`
                : "Hi, I'm your AI assistant. How can I help you with this problem?";

            if (state.messages.length === 0) {
                state.messages = [{ role: "model", parts: [{ text: greeting }] }];
            }
        },
        clearChat: (state) => {
            state.messages = [];
        },
    },
});

export const { addMessage, setMessages, clearChat, initializeChat } = chatSlice.actions;

export default chatSlice.reducer;
