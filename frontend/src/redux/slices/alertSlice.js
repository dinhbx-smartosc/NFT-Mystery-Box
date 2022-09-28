import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOpen: false,
    content: "",
    type: "info",
};

export const alertSlice = createSlice({
    name: "alert",
    initialState,
    reducers: {
        emitSuccess: (state, action) => {
            state.content = action.payload.content;
            state.type = "success";
            state.isOpen = true;
        },
        emitError: (state, action) => {
            state.content = action.payload.content;
            state.type = "error";
            state.isOpen = true;
        },
        emitWarning: (state, action) => {
            state.content = action.payload.content;
            state.type = "warning";
            state.isOpen = true;
        },
        emitInfo: (state, action) => {
            state.content = action.payload.content;
            state.type = "info";
            state.isOpen = true;
        },
        closeAlert: (state) => {
            state.content = "";
            state.type = "";
            state.isOpen = false;
        },
    },
});

export const { emitSuccess, emitError, emitInfo, emitWarning, closeAlert } = alertSlice.actions;

export default alertSlice.reducer;
