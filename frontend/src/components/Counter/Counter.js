import { Add, Remove } from "@mui/icons-material";
import { Box, IconButton, TextField } from "@mui/material";

export const Counter = ({ number, setNumber, maxNumber }) => {
    const handleIncrement = () => {
        if (number < maxNumber) {
            setNumber((prev) => {
                if (prev === "") return 1;
                return Number.parseInt(prev) + 1;
            });
        }
    };

    const handleDecrement = () => {
        if (number > 0) {
            setNumber((prev) => prev - 1);
        }
    };

    const handleInput = (e) => {
        const value = e.target.value;
        if (value === "" || (0 <= parseInt(value) && parseInt(value) <= maxNumber)) {
            setNumber(value);
        }
    };

    return (
        <Box sx={{ display: "flex", border: 1, borderColor: "text.secondary", borderRadius: 1 }}>
            <IconButton onClick={handleDecrement}>
                <Remove />
            </IconButton>
            <TextField
                size="small"
                type="number"
                placeholder="0"
                inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "center" },
                }}
                sx={{ maxWidth: 50, minWidth: 50 }}
                value={number}
                onChange={handleInput}
            />
            <IconButton onClick={handleIncrement}>
                <Add />
            </IconButton>
        </Box>
    );
};
