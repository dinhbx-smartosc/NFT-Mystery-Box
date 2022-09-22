import { Box, Button } from "@mui/material";
import { useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { useState } from "react";
import { Counter } from "../Counter";
import { BuyBoxModal } from "./BuyBoxModal";

const BuyingBox = ({ saleId, priceEach, queryData, maxBuying }) => {
    const [buyAmount, setBuyAmount] = useState("");
    const [isBuying, setBuying] = useState(false);

    const handleBuy = () => {
        if (buyAmount < 1) {
            return;
        }
        setBuying(true);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexGrow: 1,
                maxWidth: 250,
                alignItems: "end",
                justifyContent: "space-between",
            }}
        >
            <Counter number={buyAmount} setNumber={setBuyAmount} maxNumber={maxBuying} />
            <Button
                variant="contained"
                size="large"
                sx={{ flex: 1, marginLeft: 1 }}
                onClick={handleBuy}
            >
                Buy
            </Button>
            {isBuying && (
                <BuyBoxModal
                    isOpen={isBuying}
                    handleClose={() => setBuying(false)}
                    queryData={queryData}
                    saleInfo={{ saleId, buyAmount, priceEach }}
                    maxBuying={maxBuying}
                />
            )}
        </Box>
    );
};

export { BuyingBox };
