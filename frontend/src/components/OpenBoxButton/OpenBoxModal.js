import { Button, Modal, Step, StepLabel, Stepper, TextField, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import { TxStep } from "../../constant/transactionStep";
import { LoadingButton } from "@mui/lab";
import mysteryBoxAbi from "../../constant/abi/MysteryBox.json";
import { mysteryBoxAddress } from "../../constant/contractAddresses";
import { modalBoxStyle } from "../../constant/styles";
import { useDispatch } from "react-redux";
import { emitError, emitSuccess } from "../../redux/slices/alertSlice";
import EastIcon from "@mui/icons-material/East";
import { useNavigate } from "react-router-dom";

export const OpenBoxModal = ({ isOpen, handleClose, queryData, openInfo, maxOpen }) => {
    const [txStep, setTxStep] = useState(TxStep.initialize.index);
    const [openAmount, setOpenAmount] = useState(openInfo.openAmount);

    const { fetch: fetchTx, isLoading, data: txData } = useWeb3ExecuteFunction();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (openAmount !== "" && !isNaN(openAmount)) {
            setTxStep(TxStep.createTx.index);
        }
    }, [openAmount]);

    const handleBuyAmount = (e) => {
        const value = e.target.value;
        if (value === "" || (1 <= parseInt(value) && parseInt(value) <= maxOpen)) {
            setOpenAmount(value);
        }
    };

    const handleBuy = () => {
        fetchTx({
            params: {
                abi: mysteryBoxAbi,
                contractAddress: mysteryBoxAddress,
                functionName: "openBox",
                params: {
                    boxId: openInfo.boxId,
                    amount: openAmount,
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
                    }, 5000);
                });
            },
            onError: (error) => {
                dispatch(emitError({ content: "Transaction failed!" }));
                console.log(error);
            },
        });
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={{ ...modalBoxStyle }}>
                <Typography variant="h4">Open Box</Typography>
                <Stepper activeStep={txStep} sx={{ mt: 5 }}>
                    {Object.entries(TxStep).map(([_, value]) => (
                        <Step key={value.index}>
                            <StepLabel>{value.name}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <TextField
                    label="Open Amount"
                    type="number"
                    fullWidth
                    sx={{ mt: 7 }}
                    value={openAmount}
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
                                disabled={isLoading || !!txData}
                            >
                                Open
                            </LoadingButton>
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
                        <>
                            <Button
                                size="large"
                                variant="contained"
                                fullWidth
                                onClick={() => {
                                    navigate("/history");
                                }}
                                endIcon={<EastIcon />}
                                sx={{ mr: 2 }}
                            >
                                Check Open Request
                            </Button>
                            <Button size="large" variant="outlined" fullWidth onClick={handleClose}>
                                Close
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};
