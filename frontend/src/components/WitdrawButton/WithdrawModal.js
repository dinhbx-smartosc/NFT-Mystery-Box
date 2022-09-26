import { Button, Modal, Step, StepLabel, Stepper, TextField, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { TxStep } from "../../constant/transactionStep";
import { useQuery, gql } from "@apollo/client";
import { EthPriceLarge } from "../EthPrice";
import { modalBoxStyle } from "../../constant/styles";

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
                <Box sx={{ display: "flex", mt: 5 }}>
                    <Typography sx={{ fontSize: "1.5rem" }}>Balance:&nbsp;</Typography>
                    <EthPriceLarge value={balance} />
                </Box>
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
