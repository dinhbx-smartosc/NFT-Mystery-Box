import {
    Button,
    Modal,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { TxStep } from "../../constant/transactionStep";
import { gql, useLazyQuery } from "@apollo/client";
import { EthPriceLarge } from "../EthPrice";
import { modalBoxStyle } from "../../constant/styles";
import { useDispatch, useSelector } from "react-redux";
import { emitError, emitSuccess } from "../../redux/slices/alertSlice";

const GET_BALANCE = gql`
    query GetBalance($account: String) {
        ethBalance(id: $account) {
            balance
        }
    }
`;

export const WithdrawModal = ({ isOpen, handleClose }) => {
    const account = useSelector((state) => state.account.address);

    const [txStep, setTxStep] = useState(TxStep.initialize.index);

    const [
        getBalance,
        { loading: loadingBalance, error, data: balanceData, startPolling, stopPolling },
    ] = useLazyQuery(GET_BALANCE);

    const { fetch: fetchTx, isLoading: isLoadingTx, data: txData } = useWeb3ExecuteFunction();
    const dispatch = useDispatch();

    useEffect(() => {
        if (account) {
            getBalance({
                variables: {
                    account: account.toLowerCase(),
                },
            });
        }
    }, [account]);

    useEffect(() => {
        if (balanceData && balanceData.ethBalance && txStep === TxStep.initialize.index) {
            setTxStep(TxStep.createTx.index);
        }
    }, [balanceData]);

    if (error) {
        dispatch(emitError({ content: "Loading balance for withdrawing failed!" }));
        return <></>;
    }

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
                    startPolling(1000);
                    setTxStep(TxStep.complete.index + 1);
                    dispatch(emitSuccess({ content: "Transaction completed!" }));
                    setTimeout(() => {
                        stopPolling();
                    }, 3000);
                });
            },
            onError: (error) => {
                console.log(error);
                dispatch(emitError({ content: "Transaction failed!" }));
            },
        });
    };

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
                    {loadingBalance || !balanceData || !balanceData.ethBalance ? (
                        <CircularProgress />
                    ) : (
                        <EthPriceLarge value={balanceData.ethBalance.balance} />
                    )}
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
                                disabled={
                                    loadingBalance ||
                                    !balanceData ||
                                    !balanceData.ethBalance ||
                                    isLoadingTx ||
                                    balanceData.ethBalance.balance == 0 ||
                                    txData != null
                                }
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
