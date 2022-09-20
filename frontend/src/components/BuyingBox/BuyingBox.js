import { Box, Button } from "@mui/material";
import { useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { useState } from "react";
import { Counter } from "../Counter";

const BuyingBox = ({ saleId, priceEach, queryData }) => {
    const [buyAmount, setBuyAmount] = useState("");
    const { data: txData, error, fetch, isFetching, isLoading } = useWeb3ExecuteFunction();

    const handleBuy = () => {
        if (buyAmount < 1) {
            return;
        }
        queryData.startPolling(1000);
        fetch({
            params: {
                abi: marketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "buyBox",
                params: {
                    saleId: saleId,
                    amount: buyAmount,
                },
                msgValue: buyAmount * priceEach,
            },
            onSuccess: (result) => {
                result.wait().then(() => {
                    setTimeout(() => {
                        queryData.stopPolling();
                    }, 3000);
                });
            },
            onError: (error) => {
                console.log(error);
            },
        });
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
            <Counter number={buyAmount} setNumber={setBuyAmount} />
            <Button
                variant="contained"
                size="large"
                sx={{ flex: 1, marginLeft: 1 }}
                disabled={isFetching}
                onClick={handleBuy}
            >
                Buy
            </Button>
        </Box>
    );
};

export { BuyingBox };
