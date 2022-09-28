import { Button, Modal, Step, StepLabel, Stepper, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { TxStep } from "../../constant/transactionStep";
import { utils as ethersUtils } from "ethers";
import mysteryBoxAbi from "../../constant/abi/MysteryBox.json";
import { mysteryBoxAddress } from "../../constant/contractAddresses";
import { BottomAlert } from "../BottomAlert";

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

export const CreateBoxModal = ({ isOpen, handleClose, nftAddresses, tokenIds, tokenUri }) => {
    const [txStep, setTxStep] = useState(TxStep.createTx.index);
    const { fetch: fetchTx, isFetching, isLoading } = useWeb3ExecuteFunction();
    const [openError, setOpenError] = useState(false);

    const handleCreate = () => {
        fetchTx({
            params: {
                abi: mysteryBoxAbi,
                contractAddress: mysteryBoxAddress,
                functionName: "createBox",
                params: {
                    nftAddresses: nftAddresses,
                    tokenIds: tokenIds,
                    metadataURI: tokenUri,
                },
            },
            onSuccess: (result) => {
                setTxStep(TxStep.waitConfirmation.index);
                result.wait().then(() => {
                    setTxStep(TxStep.complete.index + 1);
                });
            },
            onError: (error) => {
                console.log(error);
                console.log("Loi ne");
                setOpenError(true);
            },
        });
    };

    return (
        <>
            <Modal open={isOpen} onClose={handleClose} sx={{ zIndex: "tooltip" }}>
                <Box sx={{ ...modalBoxStyle }}>
                    <Typography variant="h4">Withdraw</Typography>
                    <Stepper activeStep={txStep} sx={{ mt: 5 }}>
                        {Object.entries(TxStep).map(([_, value]) => (
                            <Step key={value.index}>
                                <StepLabel>{value.name}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <Box sx={{ display: "flex", justifyContent: "space-around", mt: 5, mb: 2 }}>
                        {txStep < TxStep.complete.index ? (
                            <>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ mr: 2 }}
                                    onClick={handleCreate}
                                    disabled={isLoading}
                                >
                                    Create
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    fullWidth
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="large"
                                variant="contained"
                                fullWidth
                                onClick={handleClose}
                            >
                                Close
                            </Button>
                        )}
                    </Box>
                </Box>
            </Modal>

            <BottomAlert
                severity="error"
                isOpen={openError}
                handleClose={() => setOpenError(false)}
            >
                Transaction failed
            </BottomAlert>
        </>
    );
};
