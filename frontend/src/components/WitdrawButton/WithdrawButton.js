import { Button } from "@mui/material";
import { useState } from "react";
import { WithdrawModal } from "./WithdrawModal";

export const WithdrawButton = ({ nftAddresses, tokenIds, tokenUri }) => {
    const [isWithdrawing, setWithdrawing] = useState(false);

    const handleWithdraw = () => {
        setWithdrawing(true);
    };

    return (
        <>
            <Button size="medium" variant="outlined" color="success" onClick={handleWithdraw}>
                Withdraw
            </Button>
            {isWithdrawing && (
                <WithdrawModal isOpen={isWithdrawing} handleClose={() => setWithdrawing(false)} />
            )}
        </>
    );
};
