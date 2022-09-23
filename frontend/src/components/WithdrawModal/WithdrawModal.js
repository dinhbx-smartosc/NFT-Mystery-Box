import { Button, Modal, Step, StepLabel, Stepper, TextField, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { TxStep } from "../../constant/transactionStep";
import { utils as ethersUtils } from "ethers";
import { useQuery, gql } from "@apollo/client";

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

const GET_BALANCE = gql`
    query GetBalance($account: String) {
        ethBalance(id: $account) {
            balance
        }
    }
`;

export const WithdrawModal = ({ isOpen, handleClose }) => {
    const { account } = useMoralis();
    const [txStep, setTxStep] = useState(TxStep.initialize.index);
    const { loading, error, data } = useQuery(GET_BALANCE, {
        variables: {
            account: account?.toLowerCase(),
        },
    });
    const [balance, setBalance] = useState(0);
    const { fetch: fetchTx, isFetching, isLoading } = useWeb3ExecuteFunction();

    useEffect(() => {
        if (!loading) {
            if (data.ethBalance) {
                setBalance(data.ethBalance.balance);
            } else {
                setBalance(0);
            }
        }
    }, [data]);

    const handleWithdraw = () => {
        fetchTx({
            params: {
                abi: marketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "withdraw",
            },
            onSuccess: (result) => {
                setTxStep(TxStep.waitConfirmation.index);
                result.wait().then(() => {
                    setTxStep(TxStep.complete.index + 1);
                });
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };

    if (loading) {
        return;
    }

    return (
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
                <Typography sx={{ my: 4, fontSize: "1.5rem" }}>
                    {`Balance: ${ethersUtils.formatEther(balance)}ETH`}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-around", mt: 5, mb: 2 }}>
                    {txStep < TxStep.complete.index ? (
                        <>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{ mr: 2 }}
                                onClick={handleWithdraw}
                                disabled={!balance || isLoading}
                            >
                                Withdraw
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
