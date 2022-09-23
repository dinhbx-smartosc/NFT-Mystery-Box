import { MenuItem, Select } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { SortType } from "../../constant/sortType";
import { changeSortType } from "../../redux/slices/sortTypeSlice";

export const SaleSortSelector = () => {
    const sortType = useSelector((state) => state.sortType.saleSortType);
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const value = e.target.value;
        dispatch(changeSortType(value));
    };

    return (
        <Select
            size="small"
            sx={{ width: 120, height: 40, ml: 5 }}
            displayEmpty
            value={sortType}
            onChange={handleChange}
        >
            <MenuItem value={SortType.newest}>Newest</MenuItem>
            <MenuItem value={SortType.priceAscending}>
                <span>Price</span>
                <span
                    style={{
                        fontSize: 25,
                        fontWeight: "bolder",
                        margin: 0,
                        padding: 0,
                    }}
                >
                    &uarr;
                </span>
            </MenuItem>
            <MenuItem value={SortType.priceDescending}>
                <span>Price</span>
                <span
                    style={{
                        fontSize: 25,
                        fontWeight: "bolder",
                        margin: 0,
                        padding: 0,
                    }}
                >
                    &darr;
                </span>
            </MenuItem>
        </Select>
    );
};
