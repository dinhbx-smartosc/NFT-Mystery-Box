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
import * as yup from "yup";
import { useFormik } from "formik";

export const OpenBoxModal = ({ isOpen, handleClose, queryData, openInfo, maxOpen, setCounter }) => {
    const [txStep, setTxStep] = useState(TxStep.initialize.index);

    const { fetch: fetchTx, isLoading, data: txData } = useWeb3ExecuteFunction();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validationSchema = yup.object({
        openAmount: yup.number().integer().min(1).max(maxOpen).required(),
    });

    const formik = useFormik({
        initialValues: {
            openAmount: openInfo.openAmount,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

    useEffect(() => {
        if (!formik.errors.openAmount && formik.values.openAmount !== "") {
            if (txStep === TxStep.initialize.index) {
                setTxStep(TxStep.createTx.index);
            }
        } else {
            if (txStep === TxStep.createTx.index) {
                setTxStep(TxStep.initialize.index);
            }
        }
    }, [formik.errors.openAmount]);

    const handleSubmit = (values) => {
        fetchTx({
            params: {
                abi: mysteryBoxAbi,
                contractAddress: mysteryBoxAddress,
                functionName: "openBox",
                params: {
                    boxId: openInfo.boxId,
                    amount: values.openAmount.toString(),
                },
            },
            onSuccess: (result) => {
                queryData.startPolling(1000);
                setTxStep(TxStep.waitConfirmation.index);
                result.wait().then(() => {
                    dispatch(emitSuccess({ content: "Transaction completed!" }));
                    setTxStep(TxStep.complete.index + 1);
                    setCounter("");
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
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        label="Open Amount"
                        type="number"
                        fullWidth
                        sx={{ mt: 7 }}
                        disabled={isLoading || txStep >= TxStep.waitConfirmation.index}
                        id="openAmount"
                        name="openAmount"
                        value={formik.values.openAmount}
                        onChange={formik.handleChange}
                        error={formik.touched.openAmount && Boolean(formik.errors.openAmount)}
                        helperText={formik.touched.openAmount && formik.errors.openAmount}
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
                                    disabled={isLoading || !!txData}
                                    type="submit"
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
                                <Button
                                    size="large"
                                    variant="outlined"
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
