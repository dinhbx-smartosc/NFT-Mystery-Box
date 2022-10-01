import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { emitInfo } from "../../redux/slices/alertSlice";
import { Counter } from "../Counter";
import { BuyBoxModal } from "./BuyBoxModal";

const BuyingBox = ({ saleId, priceEach, queryData, maxBuying }) => {
    const [buyAmount, setBuyAmount] = useState("");
    const [isBuying, setBuying] = useState(false);
    const dispatch = useDispatch();

    const handleBuy = () => {
        if (buyAmount < 1) {
            dispatch(emitInfo({ content: "Buy amount should be greater than 0" }));
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
                    selectBuy={setBuyAmount}
                />
            )}
        </Box>
    );
};

export { BuyingBox };
