import { Box, Icon, Typography } from "@mui/material";

export const EmptyAlert = ({ content }) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", p: 20 }}>
            <Icon sx={{ fontSize: 100 }}>
                <img style={{ height: "100%" }} src="/images/empty.svg" />
            </Icon>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2}}>
                {content}
            </Typography>
        </Box>
    );
};
