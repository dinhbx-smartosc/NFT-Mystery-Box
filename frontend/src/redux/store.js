import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import sortTypeReducer from "./slices/sortTypeSlice";
import accountReducer from "./slices/accountSlice";

export const store = configureStore({
    reducer: {
        sortType: sortTypeReducer,
        account: accountReducer,
    },
});

export const GlobalStateProvider = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
};
