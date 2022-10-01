import { Button, Modal, Step, StepLabel, Stepper, TextField, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { TxStep } from "../../constant/transactionStep";
import { LoadingButton } from "@mui/lab";
import { modalBoxStyle } from "../../constant/styles";
import { useDispatch } from "react-redux";
import { emitError, emitSuccess } from "../../redux/slices/alertSlice";
import EastIcon from "@mui/icons-material/East";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useFormik } from "formik";

export const BuyBoxModal = ({ isOpen, handleClose, queryData, saleInfo, selectBuy, maxBuying }) => {
    const [txStep, setTxStep] = useState(TxStep.initialize.index);
    const [buyAmount, setBuyAmount] = useState(saleInfo.buyAmount);
    const { fetch: fetchTx, isFetching, isLoading } = useWeb3ExecuteFunction();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validationSchema = yup.object({
        buyAmount: yup.number().integer().min(1).max(maxBuying).required(),
    });

    const formik = useFormik({
        initialValues: {
            buyAmount: saleInfo.buyAmount,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

    useEffect(() => {
        if (!formik.errors.buyAmount && formik.values.buyAmount !== "") {
            setTxStep(TxStep.createTx.index);
        }
    }, [formik.errors.buyAmount]);

    const handleSubmit = (values) => {
        fetchTx({
            params: {
                abi: marketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "buyBox",
                params: {
                    saleId: saleInfo.saleId,
                    amount: buyAmount,
                },
                msgValue: values.buyAmount * saleInfo.priceEach,
            },
            onSuccess: (result) => {
                queryData.startPolling(1000);
                setTxStep(TxStep.waitConfirmation.index);
                result.wait().then(() => {
                    setTxStep(TxStep.complete.index + 1);
                    dispatch(emitSuccess({ content: "Transaction completed!" }));
                    selectBuy("");
                    setTimeout(() => {
                        queryData.stopPolling();
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
        <Modal open={isOpen} onClose={!isFetching ? handleClose : null} sx={{ zIndex: "tooltip" }}>
            <Box sx={{ ...modalBoxStyle }}>
                <Typography variant="h4">Buy Box</Typography>
                <Stepper activeStep={txStep} sx={{ mt: 5 }}>
                    {Object.entries(TxStep).map(([_, value]) => (
                        <Step key={value.index}>
                            <StepLabel>{value.name}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        label="New Price"
                        type="number"
                        fullWidth
                        sx={{ mt: 7 }}
                        disabled={isLoading || txStep >= TxStep.waitConfirmation.index}
                        id="buyAmount"
                        name="buyAmount"
                        value={formik.values.buyAmount}
                        onChange={formik.handleChange}
                        error={formik.touched.buyAmount && Boolean(formik.errors.buyAmount)}
                        helperText={formik.touched.buyAmount && formik.errors.buyAmount}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-around", mt: 5, mb: 2 }}>
                        {txStep < TxStep.complete.index ? (
                            <>
                                <LoadingButton
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ mr: 2 }}
                                    loading={isLoading}
                                    type="submit"
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
                            <>
                                <Button
                                    size="large"
                                    variant="contained"
                                    fullWidth
                                    onClick={() => {
                                        navigate("/owned");
                                    }}
                                    sx={{ mr: 2 }}
                                    endIcon={<EastIcon />}
                                >
                                    Your Box
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    fullWidth
                                    onClick={handleClose}
                                >
                                    Close
                                </Button>
                            </>
                        )}
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};
