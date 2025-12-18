import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';
import axios from 'axios';

export const registerUser = createAsyncThunk(
    'auth/register',    // action
    async (userData, { rejectWithValue }) => {        // on submitted form data will be sent to userData
        try {
            const response = await axiosClient.post('/user/register', userData);        // post request to /user/register
            return response.data.user;      // sent data to payload
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/user/login', credentials);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)

export const checkAuth = createAsyncThunk(
    'auth/check',
    async (_, { rejectWithValue }) => {       // _ no data is sending
        try {
            const { data } = await axiosClient.get('/user/check');
            return data.user;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)


export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await axiosClient.post('/user/logout');
            return null;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
)


export const updateProfile = createAsyncThunk('auth/updateProfile', async (updatedData, { rejectWithValue }) => {
    try {
        // For example, make an API call to update the user profile
        const response = await api.put('/user/profile', updatedData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const googleLogin = createAsyncThunk(
    "auth/googleLogin",
    async (token, { rejectWithValue }) => {
        try {
            const res = await axiosClient.post("/user/google-signin", {
                token
            });
            return res.data.user;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);


export const createAdmin = createAsyncThunk(
    "auth/createAdmin",
    async (data, { rejectWithValue }) => {
        try {
            const res = await axiosClient.post("/user/admin/register", data);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response.data.message);
        }
    }
);


export const manageUsers = createAsyncThunk(
    "auth/manageUsers",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosClient.get("/user/getAllUsers");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,         // admin or user
        isAuthenticated: false,
        loading: false,
        usersLoading: false,
        error: null,
        usersList: []
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

            // update profile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true,
                    state.error = null
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false,
                    state.isAuthenticated = !!action.payload,
                    state.user = action.payload
            })

            // google sign in
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload;
            })

            // create admin cases
            .addCase(createAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // ❌ do NOT change user or isAuthenticated
            })
            .addCase(createAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create admin";
            })

            // manage users cases
            .addCase(manageUsers.pending, (state) => {
                state.usersLoading = true;
                state.error = null;
            })
            .addCase(manageUsers.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.usersList = action.payload;
            })
            .addCase(manageUsers.rejected, (state, action) => {
                state.usersLoading = false;
                state.error = action.payload || "Failed to fetch users";
            });


    }
})

export default authSlice.reducer;

// time 55min