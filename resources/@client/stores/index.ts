import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "./slices/locationSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
    reducer: {
        location: locationReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
