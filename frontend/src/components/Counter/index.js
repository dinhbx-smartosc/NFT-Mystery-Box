import { Add, Remove } from "@mui/icons-material";
import { Box, IconButton, TextField } from "@mui/material";

const Counter = () => {
    return (
        <Box sx={{ display: "flex", border: 1, borderColor: "text.secondary", borderRadius: 1 }}>
            <IconButton>
                <Remove />
            </IconButton>
            <TextField
                size="small"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                sx={{ maxWidth: 50 }}
            >
                1000
            </TextField>
            <IconButton>
                <Add />
            </IconButton>
        </Box>
    );
};

export default Counter;
