import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";
import api from "@/services/ApiService";

// ========== INTERFACES ==========

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role_id?: number;
    role_name?: string;
    role?: any;
    department_id?: number;
    department_name?: string;
    country_id?: number;
    country_name?: string;
    state_id?: number;
    state_name?: string;
    city_id?: number;
    city_name?: string;
    address_line_1?: string;
    address_line_2?: string;
    address_line_3?: string;
    pincode?: string;
    dob?: string;
    status?: string;
    permissions?: string[]; // Array of permission key_names like 'users.view', 'roles.edit'
}
export interface Role {
    id: number;
    name: string;
    description: string;
    status: string;
}

interface AuthState {
    roles: Role[];
    user: UserProfile | null;
    loading: {
        roles: boolean;
        user: boolean;
    };
    error: string | null;
}

const initialState: AuthState = {
    roles: [],
    user: null,
    loading: {
        roles: false,
        user: false,
    },
    error: null,
};

export const fetchUserProfile = createAsyncThunk(
    "auth/fetchUserProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/profile");
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch profile",
            );
        }
    },
);

// Logout action
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/logout");

            if (response.data.status === "success") {
                localStorage.clear();
                sessionStorage.clear();

                return;
            } else {
                throw new Error(response.data.message || "Failed to logout");
            }
        } catch (error: any) {
            localStorage.clear();
            sessionStorage.clear();

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to logout";
            return rejectWithValue(errorMessage);
        }
    },
);

// Fetch all roles
export const fetchRoles = createAsyncThunk(
    "auth/fetchRoles",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post("/roles");
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch roles",
            );
        }
    },
);

// ========== SLICE ==========
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearRoles: (state) => {
            state.roles = [];
        },
    },
    extraReducers: (builder) => {
        // Fetch User Profile
        builder.addCase(fetchUserProfile.pending, (state) => {
            state.loading.user = true;
            state.error = null;
        });
        builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
            state.loading.user = false;
            state.user = action.payload;
        });
        builder.addCase(fetchUserProfile.rejected, (state, action) => {
            state.loading.user = false;
            state.error = action.payload as string;
        });
        // Logout
        builder.addCase(logout.pending, (state) => {
            state.loading.user = true;
        });

        builder.addCase(logout.fulfilled, (state) => {
            state.loading.user = false;
            state.user = null; // ✅ clear user
            state.roles = []; // ✅ clear roles
            state.error = null;
        });

        builder.addCase(logout.rejected, (state, action) => {
            state.loading.user = false;
            state.error = action.payload as string;
        });
        // Fetch Roles
        builder.addCase(fetchRoles.pending, (state) => {
            state.loading.roles = true;
            state.error = null;
        });
        builder.addCase(fetchRoles.fulfilled, (state, action) => {
            state.loading.roles = false;
            state.roles = action.payload;
        });
        builder.addCase(fetchRoles.rejected, (state, action) => {
            state.loading.roles = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearRoles } = authSlice.actions;
export default authSlice.reducer;
