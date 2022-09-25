import { Box, Typography } from "@mui/material";

export const Footer = () => {
    return (
        <Box
            sx={{
                height: "30vh",
                backgroundColor: "#1976d2",
                mt: 10,
                py: 5,
                px: 10,
            }}
        >
            <Box sx={{ maxWidth: 250 }}>
                <img src="/sumup_logo_v3.png" style={{ height: "80px" }} />
                <Typography sx={{ mt: 2, color: "#fff" }}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem dicta temporibus
                    officiis aut. Reprehenderit veritatis vero qui porro inventore voluptates.
                </Typography>
            </Box>
        </Box>
    );
};
