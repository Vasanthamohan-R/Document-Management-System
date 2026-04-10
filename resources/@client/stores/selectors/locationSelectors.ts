import { RootState } from "../index";

export const selectCountries = (state: RootState) => state.location.countries;
export const selectAllStates = (state: RootState) => state.location.allStates;
export const selectAllCities = (state: RootState) => state.location.allCities;
export const selectLocationLoading = (state: RootState) =>
    state.location.loading;
export const selectLocationError = (state: RootState) => state.location.error;

// Memoized selectors for filtering


export const selectCitiesByState = (state: RootState, stateId: number) => {
    return state.location.allCities.filter((city) => city.state_id === stateId);
};
