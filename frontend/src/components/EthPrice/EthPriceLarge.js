import { Box, Icon, Typography } from "@mui/material";
import { utils as ethersUtils } from "ethers";

const removeDecimal = (value) => {
    if (Math.floor(value) === Number(value)) {
        return parseInt(value).toString();
    }
    return value;
};

export const EthPriceLarge = ({ value }) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h5" component="div">
                {removeDecimal(ethersUtils.formatEther(value))}
            </Typography>
            <Icon fontSize="small">
                <img style={{ height: "100%" }} src="/images/eth.svg" />
            </Icon>
        </Box>
    );
};
