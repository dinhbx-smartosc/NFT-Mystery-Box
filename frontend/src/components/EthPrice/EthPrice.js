import { Box, Icon, Typography } from "@mui/material";
import { utils as ethersUtils } from "ethers";
const removeDecimal = (value) => {
    if (Math.floor(value) === Number(value)) {
        return parseInt(value).toString();
    }
    return value;
};

export const EthPrice = ({ value }) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1" component="div">
                {removeDecimal(ethersUtils.formatEther(value))}
            </Typography>
            <Icon sx={{ fontSize: 18 }}>
                <img style={{ height: "100%" }} src="/images/eth.svg" />
            </Icon>
        </Box>
    );
};
