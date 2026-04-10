import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/ApiService";

// Types
interface Country {
    id: number;
    name: string;
    alpha_2: string;
    alpha_3: string;
}

interface State {
    id: number;
    country_id: number;
    name: string;
    code: string;
}

interface City {
    id: number;
    country_id: number;
    state_id: number;
    name: string;
    code: string;
}

// Add to interfaces
export interface Department {
    id: number;
    name: string;
    description?: string;
    status?: string;
}

interface LocationState {
    countries: Country[];
    allStates: State[];
    allCities: City[];
    allDepartments: Department[];
    loading: {
        countries: boolean;
        states: boolean;
        cities: boolean;
        departments: boolean;
    };
    error: string | null;
}

// Initial State
const initialState: LocationState = {
    countries: [],
    allStates: [],
    allCities: [],
    allDepartments: [],
    loading: {
        countries: false,
        states: false,
        cities: false,
        departments: false,
    },
    error: null,
};

// Async Thunks
export const fetchCountries = createAsyncThunk(
    "location/fetchCountries",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { location: LocationState };
            // Return cached data if already exists
            if (state.location.countries.length > 0) {
                return state.location.countries;
            }
            const response = await api.post("country");
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch countries",
            );
        }
    },
);

export const fetchStates = createAsyncThunk(
    "location/fetchStates",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post("state");
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch states",
            );
        }
    },
);

export const fetchCities = createAsyncThunk(
    "location/fetchCities",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post("city");
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch cities",
            );
        }
    },
);

// Add fetchDepartments thunk
export const fetchDepartments = createAsyncThunk(
    "location/fetchDepartments",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { location: LocationState };
            if (state.location.allDepartments.length > 0) {
                return state.location.allDepartments;
            }

            const response = await api.post("/department"); // Create this endpoint
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch departments",
            );
        }
    },
);

// Location Slice
const locationSlice = createSlice({
    name: "location",
    initialState,
    reducers: {
        clearLocationData: (state) => {
            state.countries = [];
            state.allStates = [];
            state.allCities = [];
            state.allDepartments = [];
        },
        clearStates: (state) => {
            state.allStates = [];
        },
        clearCities: (state) => {
            state.allCities = [];
        },
        clearDepartments: (state) => {
            state.allDepartments = [];
        },
    },

    extraReducers: (builder) => {
        // Fetch Countries
        builder.addCase(fetchCountries.pending, (state) => {
            state.loading.countries = true;
            state.error = null;
        });
        builder.addCase(fetchCountries.fulfilled, (state, action) => {
            state.loading.countries = false;
            state.countries = action.payload;
        });
        builder.addCase(fetchCountries.rejected, (state, action) => {
            state.loading.countries = false;
            state.error = action.payload as string;
        });

        // Fetch States
        builder.addCase(fetchStates.pending, (state) => {
            state.loading.states = true;
            state.error = null;
        });
        builder.addCase(fetchStates.fulfilled, (state, action) => {
            state.loading.states = false;
            state.allStates = action.payload;
        });
        builder.addCase(fetchStates.rejected, (state, action) => {
            state.loading.states = false;
            state.error = action.payload as string;
        });

        // Fetch Cities
        builder.addCase(fetchCities.pending, (state) => {
            state.loading.cities = true;
            state.error = null;
        });
        builder.addCase(fetchCities.fulfilled, (state, action) => {
            state.loading.cities = false;
            state.allCities = action.payload;
        });
        builder.addCase(fetchCities.rejected, (state, action) => {
            state.loading.cities = false;
            state.error = action.payload as string;
        });

        // Add fetchDepartments
        builder.addCase(fetchDepartments.pending, (state) => {
            state.loading.departments = true;
            state.error = null;
        });
        builder.addCase(fetchDepartments.fulfilled, (state, action) => {
            state.loading.departments = false;
            state.allDepartments = action.payload;
        });
        builder.addCase(fetchDepartments.rejected, (state, action) => {
            state.loading.departments = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearLocationData, clearStates, clearCities, clearDepartments } =
    locationSlice.actions;
export default locationSlice.reducer;
