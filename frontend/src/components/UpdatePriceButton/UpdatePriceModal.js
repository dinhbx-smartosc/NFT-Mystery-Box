import { Button, Modal, Step, StepLabel, Stepper, TextField, Typography, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { marketplaceAddress } from "../../constant/contractAddresses";
import { TxStep } from "../../constant/transactionStep";
import { utils as ethersUtils } from "ethers";
import { modalBoxStyle } from "../../constant/styles";
import { useDispatch } from "react-redux";
import { emitError, emitSuccess } from "../../redux/slices/alertSlice";
import * as yup from "yup";
import { useFormik } from "formik";

const validationSchema = yup.object({
    newPrice: yup.number().positive().max(9999).required(),
});

export const UpdatePriceModal = ({ isOpen, handleClose, saleId, queryData }) => {
    const [txStep, setTxStep] = useState(TxStep.initialize.index);
    const { fetch: fetchTx, isLoading, data: txData } = useWeb3ExecuteFunction();
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            newPrice: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

    useEffect(() => {
        if (!formik.errors.newPrice && formik.values.newPrice !== "") {
            if (txStep === TxStep.initialize.index) {
                setTxStep(TxStep.createTx.index);
            }
        } else {
            if (txStep === TxStep.createTx.index) {
                setTxStep(TxStep.initialize.index);
            }
        }
    }, [formik.errors.newPrice]);

    const handleSubmit = (values) => {
        fetchTx({
            params: {
                abi: marketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "updatePrice",
                params: {
                    saleId: saleId,
                    newPrice: ethersUtils.parseEther(values.newPrice.toString()),
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
                console.log(error);
                dispatch(emitError({ content: "Transaction failed!" }));
            },
        });
    };

    return (
        <Modal open={isOpen} onClose={handleClose} sx={{ zIndex: "tooltip" }}>
            <Box sx={{ ...modalBoxStyle }}>
                <Typography variant="h4">Update Price</Typography>
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
                        id="newPrice"
                        name="newPrice"
                        value={formik.values.newPrice}
                        onChange={formik.handleChange}
                        error={formik.touched.newPrice && Boolean(formik.errors.newPrice)}
                        helperText={formik.touched.newPrice && formik.errors.newPrice}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-around", mt: 5, mb: 2 }}>
                        {txStep < TxStep.complete.index ? (
                            <>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ mr: 2 }}
                                    type="submit"
                                    disabled={isLoading || !!txData}
                                >
                                    Update
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
                </form>
            </Box>
        </Modal>
    );
};
