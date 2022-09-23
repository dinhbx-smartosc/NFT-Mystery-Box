import { Box, Typography } from "@mui/material";
import { Image } from "mui-image";

export const Banner = ({ image, content }) => {
    return (
        <Box sx={{ position: "relative" }}>
            <Box
                sx={{
                    bgcolor: "#161616",
                    opacity: 0.5,
                    borderRadius: 1,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 1,
                    height: 1,
                    zIndex: "tooltip",
                }}
            ></Box>
            <Typography
                variant="h2"
                sx={{
                    textAlign: "center",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: "tooltip",
                    color: "#fff",
                    fontSize: "5rem",
                    fontWeight: "600",
                }}
            >
                {content}
            </Typography>
            <Image duration={0} height="30vh" src={image} />
        </Box>
    );
};
