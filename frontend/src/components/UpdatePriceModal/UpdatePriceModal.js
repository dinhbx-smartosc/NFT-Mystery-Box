import { Button, Modal, Step, StepLabel, Stepper, TextField, Typography, Box } from "@mui/material";
import { useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { TxStep } from "../../constant/transactionStep";
import { utils as ethersUtils } from "ethers";

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

export const UpdatePriceModal = ({ isOpen, handleClose, saleId, queryData }) => {
    const [txStep, setTxStep] = useState(TxStep.initialize.index);
    const [newPrice, setNewPrice] = useState("");
    const { fetch: fetchTx, isFetching, isLoading } = useWeb3ExecuteFunction();

    const handleNewPrice = (e) => {
        const value = e.target.value;
        if (value !== "" && !isNaN(value)) {
            setTxStep(TxStep.createTx.index);
        }
        setNewPrice(value);
    };

    const handleUpdate = () => {
        fetchTx({
            params: {
                abi: marketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "updatePrice",
                params: {
                    saleId: saleId,
                    newPrice: ethersUtils.parseEther(newPrice),
                },
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
        <Modal open={isOpen} onClose={handleClose}>
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
                    value={newPrice}
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
                                disabled={isLoading}
                            >
                                Update
                            </Button>
                            <Button variant="outlined" size="large" fullWidth onClick={handleClose}>
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
