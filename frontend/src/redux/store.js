import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import sortTypeReducer from "./slices/sortTypeSlice";

export const store = configureStore({
    reducer: {
        sortType: sortTypeReducer,
    },
});

export const GlobalStateProvider = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
};
