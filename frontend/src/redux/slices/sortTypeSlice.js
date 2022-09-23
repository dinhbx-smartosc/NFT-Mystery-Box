import { createSlice } from "@reduxjs/toolkit";
import { SortType } from "../../constant/sortType";

const initialState = {
    saleSortType: SortType.newest,
};

export const sortTypeSlice = createSlice({
    name: "sortType",
    initialState,
    reducers: {
        changeSortType: (state, action) => {
            state.saleSortType = action.payload;
        },
    },
});

export const { changeSortType } = sortTypeSlice.actions;

export default sortTypeSlice.reducer;
