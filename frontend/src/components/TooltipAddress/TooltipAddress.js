import { Tooltip, Typography } from "@mui/material";

export const TooltipAddress = ({ address, styles }) => {
    return (
        <Tooltip title={address} arrow>
            <Typography noWrap variant="body2" color="text.secondary" sx={styles}>
                {address}
            </Typography>
        </Tooltip>
    );
};
