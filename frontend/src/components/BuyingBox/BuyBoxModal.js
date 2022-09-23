import { Button, Modal, Step, StepLabel, Stepper, TextField, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { TxStep } from "../../constant/transactionStep";
import { utils as ethersUtils } from "ethers";
import { LoadingButton } from "@mui/lab";

const modalBoxStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 0.3,
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    px: 3,
    py: 5,
};

export const BuyBoxModal = ({ isOpen, handleClose, queryData, saleInfo, maxBuying }) => {
    const [txStep, setTxStep] = useState(TxStep.initialize.index);
    const [buyAmount, setBuyAmount] = useState(saleInfo.buyAmount);
    const { fetch: fetchTx, isFetching, isLoading } = useWeb3ExecuteFunction();

    useEffect(() => {
        if (buyAmount !== "" && !isNaN(buyAmount)) {
            setTxStep(TxStep.createTx.index);
        }
    }, [buyAmount]);

    const handleBuyAmount = (e) => {
        const value = e.target.value;
        if (value === "" || (1 <= parseInt(value) && parseInt(value) <= maxBuying)) {
            setBuyAmount(value);
        }
    };

    const handleBuy = () => {
        fetchTx({
            params: {
                abi: marketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "buyBox",
                params: {
                    saleId: saleInfo.saleId,
                    amount: buyAmount,
                },
                msgValue: buyAmount * saleInfo.priceEach,
            },
            onSuccess: (result) => {
                queryData.startPolling(1000);
                setTxStep(TxStep.waitConfirmation.index);
                result.wait().then(() => {
                    setTxStep(TxStep.complete.index + 1);
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
        <Modal open={isOpen} onClose={!isFetching ? handleClose : null} sx={{ zIndex: "tooltip" }}>
            <Box sx={{ ...modalBoxStyle }}>
                <Typography variant="h4">Update Price</Typography>
                <Stepper activeStep={txStep} sx={{ mt: 5 }}>
                    {Object.entries(TxStep).map(([_, value]) => (
                        <Step key={value.index}>
                            <StepLabel>{value.name}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <TextField
                    label="New Price"
                    type="number"
                    fullWidth
                    sx={{ mt: 7 }}
                    value={buyAmount}
                    onChange={handleBuyAmount}
                    disabled={isLoading || txStep >= TxStep.waitConfirmation.index}
                />
                <Box sx={{ display: "flex", justifyContent: "space-around", mt: 5, mb: 2 }}>
                    {txStep < TxStep.complete.index ? (
                        <>
                            <LoadingButton
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{ mr: 2 }}
                                onClick={handleBuy}
                                loading={isLoading}
                            >
                                Buy
                            </LoadingButton>
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button size="large" variant="contained" fullWidth onClick={handleClose}>
                            Close
                        </Button>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};
