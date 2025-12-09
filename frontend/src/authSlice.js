import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';
import axios from 'axios';

export const registerUser = createAsyncThunk(
    'auth/register',    // api
    async (userData, {rejectWithValue}) => {        // on submitted form data will be sent to userData
        try {
            const response = await axiosClient.post('/user/register', userData);        // post request to /user/register
            return response.data.user;      // sent data to payload
        } catch(error) {
            return rejectWithValue(error);
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, {rejectWithValue}) => {
        try {
            const response = await axiosClient.post('/user/login', credentials);
            return response.data.user;
        } catch(error) {
            return rejectWithValue(error);
        }
    }
)

export const checkAuth = createAsyncThunk(
    'auth/check',
    async (_, {rejectWithValue}) => {       // _ no data is sending
        try {
            const {data} = await axiosClient.get('/user/check');
            return data.user;
        } catch(error) {
            return rejectWithValue(error);
        }
    }
)


export const logoutUser = createAsyncThunk(
    'auth/logout',
    async(_, {rejectWithValue}) => {
        try {
            await axiosClient.post('/user/logout');
            return null;
        }catch(error) {
            return rejectWithValue(error);
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,         // admin or user
        isAuthenticated: false,
        loading: false,
        error: null
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            // registerUser cases
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = !!action.payload;
                state.user = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Something went wrong";
                state.isAuthenticated = false;
                state.user = null;
            })

            // Login user cases
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Something went wrong";
                state.isAuthenticated = false;
                state.user = null;
            })

            // check auth cases
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Something went wrong";
                state.isAuthenticated = false;
                state.user = null;
            }) 

            // logout user cases
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Something went wrong";
                state.isAuthenticated = false;
                state.user = null;
            })
    }
})

export default authSlice.reducer;

// time 55min