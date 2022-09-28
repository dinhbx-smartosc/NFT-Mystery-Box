import { Button, Modal, Step, StepLabel, Stepper, TextField, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { TxStep } from "../../constant/transactionStep";
import { modalBoxStyle } from "../../constant/styles";
import { useDispatch } from "react-redux";
import { emitError, emitSuccess } from "../../redux/slices/alertSlice";

export const CancelSaleModal = ({ isOpen, handleClose, queryData, saleInfo }) => {
    const [txStep, setTxStep] = useState(TxStep.initialize.index);
    const [cancelAmount, setCancelAmount] = useState("");
    const { fetch: fetchTx, isLoading, data: txData } = useWeb3ExecuteFunction();
    const dispatch = useDispatch();

    useEffect(() => {
        if (cancelAmount !== "" && !isNaN(cancelAmount)) {
            setTxStep(TxStep.createTx.index);
        }
    }, [cancelAmount]);

    const handleNewPrice = (e) => {
        const value = e.target.value;
        if (value === "" || (1 <= parseInt(value) && parseInt(value) <= saleInfo.amount)) {
            setCancelAmount(value);
        }
    };

    const handleUpdate = () => {
        fetchTx({
            params: {
                abi: marketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "cancelSelling",
                params: {
                    saleId: saleInfo.saleId,
                    amount: cancelAmount,
                },
            },
            onSuccess: (result) => {
                queryData.startPolling(1000);
                setTxStep(TxStep.waitConfirmation.index);
                result.wait().then(() => {
                    dispatch(emitSuccess({ content: "Transaction completed!" }));
                    setTxStep(TxStep.complete.index + 1);
                    setTimeout(() => {
                        queryData.stopPolling();
                    }, 3000);
                });
            },
            onError: (error) => {
                dispatch(emitError({ content: "Transaction failed!" }));
                console.log(error);
            },
        });
    };

    return (
        <Modal open={isOpen} onClose={handleClose} sx={{ zIndex: "tooltip" }}>
            <Box sx={{ ...modalBoxStyle }}>
                <Typography variant="h4">Cancel Selling</Typography>
                <Stepper activeStep={txStep} sx={{ mt: 5 }}>
                    {Object.entries(TxStep).map(([_, value]) => (
                        <Step key={value.index}>
                            <StepLabel>{value.name}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <TextField
                    label="Cancel Amount"
                    type="number"
                    fullWidth
                    sx={{ mt: 7 }}
                    value={cancelAmount}
                    onChange={handleNewPrice}
                    disabled={isLoading || txStep >= TxStep.waitConfirmation.index}
                />
                <Box sx={{ display: "flex", justifyContent: "space-around", mt: 5, mb: 2 }}>
                    {txStep < TxStep.complete.index ? (
                        <>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{ mr: 2 }}
                                onClick={handleUpdate}
                                disabled={isLoading || !!txData}
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                onClick={handleClose}
                                disabled={!!txData}
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
