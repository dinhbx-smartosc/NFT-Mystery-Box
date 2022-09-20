import { Button, Modal, Box, Typography, TextField, Stepper, Step, StepLabel } from "@mui/material";
import { useEffect, useState } from "react";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { useWeb3ExecuteFunction } from "react-moralis";
import mysteryBoxAbi from "../../constant/abi/MysteryBox.json";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { mysteryBoxAddress, marketplaceAddress } from "../../constant/contractAddresses";
import { utils as ethersUtils } from "ethers";

const style = {
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

const Steps = {
    initializeSale: 0,
    approveBox: 1,
    createSale: 2,
    completed: 3,
};

const GET_APPROVAL = gql`
    query GetApproval($id: String) {
        approval(id: $id) {
            approved
        }
    }
`;

export const SellBoxModal = ({ isSelling, handleClose, owner, boxId, queryData }) => {
    console.log("Selling Modal");

    const [sellingStep, setSellingStep] = useState(Steps.initializeSale);
    const [sellAmount, setSellAmount] = useState("");
    const [priceEach, setPriceEach] = useState("");
    const { data, error, fetch, isFetching, isLoading } = useWeb3ExecuteFunction();

    const { data: approveData } = useQuery(GET_APPROVAL, {
        variables: {
            id: owner.toLowerCase() + "." + marketplaceAddress.toLowerCase(),
        },
        pollInterval: 1000,
    });

    useEffect(() => {
        if (sellAmount !== "" && priceEach !== "" && !isNaN(sellAmount) && !isNaN(priceEach)) {
            setSellingStep(Steps.approveBox);
        } else {
            setSellingStep(Steps.initializeSale);
        }
    }, [sellAmount, priceEach]);

    useEffect(() => {
        if (approveData && approveData.approval?.approved) {
            if (sellingStep === Steps.approveBox) {
                setSellingStep(Steps.createSale);
            }
        } else {
            if (sellingStep === Steps.createSale) {
                setSellingStep(Steps.approveBox);
            }
        }
    }, [approveData, sellingStep]);

    const handleConfirm = () => {
        if (sellingStep === Steps.approveBox) {
            fetch({
                params: {
                    abi: mysteryBoxAbi,
                    contractAddress: mysteryBoxAddress,
                    functionName: "setApprovalForAll",
                    params: {
                        operator: marketplaceAddress,
                        approved: true,
                    },
                },
                onError: (error) => {
                    console.log(error);
                },
            });
            return;
        }
        if (sellingStep === Steps.createSale) {
            fetch({
                params: {
                    abi: marketplaceAbi,
                    contractAddress: marketplaceAddress,
                    functionName: "createSale",
                    params: {
                        boxId: boxId,
                        amount: sellAmount,
                        priceEach: ethersUtils.parseEther(priceEach),
                    },
                },
                onSuccess: (result) => {
                    queryData.startPolling(1000);
                    result.wait().then((tx) => {
                        setSellingStep(Steps.completed + 1);
                        setTimeout(() => {
                            queryData.stopPolling();
                        }, 3000);
                    });
                },
                onError: (error) => {
                    console.log(error);
                },
            });
            return;
        }
    };

    return (
        <Modal
            open={isSelling}
            onClose={!isFetching ? handleClose : null}
            aria-labelledby="selling-box-title"
            aria-describedby="selling-box-description"
        >
            <Box sx={{ ...style }}>
                <Typography variant="h4">Sell Box</Typography>
                <TextField
                    label="Sell Amount"
                    type="number"
                    fullWidth
                    sx={{ mt: 7 }}
                    value={sellAmount}
                    disabled={isLoading || sellingStep > Steps.createSale}
                    onChange={(e) => setSellAmount(e.target.value)}
                />
                <TextField
                    label="Price Each"
                    type="number"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={priceEach}
                    disabled={isLoading || sellingStep > Steps.createSale}
                    onChange={(e) => setPriceEach(e.target.value)}
                />
                <Stepper activeStep={sellingStep} sx={{ mt: 5 }}>
                    <Step>
                        <StepLabel>Initialize Sale</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Approve Box</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Create Sale</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Completed</StepLabel>
                    </Step>
                </Stepper>
                {sellingStep < Steps.completed ? (
                    <Box sx={{ display: "flex", justifyContent: "space-around", mt: 5 }}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{ mr: 2 }}
                            disabled={isLoading || sellingStep > Steps.createSale}
                            onClick={handleConfirm}
                        >
                            {sellingStep === Steps.createSale ? "Create" : "Approve"}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            disabled={isFetching}
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </Box>
                ) : (
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ mt: 5 }}
                        onClick={handleClose}
                    >
                        Close
                    </Button>
                )}
            </Box>
        </Modal>
    );
};
