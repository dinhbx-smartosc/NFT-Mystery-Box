import { Button, Modal, Box, Typography, TextField, Stepper, Step, StepLabel } from "@mui/material";
import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useWeb3ExecuteFunction } from "react-moralis";
import mysteryBoxAbi from "../../constant/abi/MysteryBox.json";
import marketplaceAbi from "../../constant/abi/Marketplace.json";
import { mysteryBoxAddress, marketplaceAddress } from "../../constant/contractAddresses";
import { utils as ethersUtils } from "ethers";
import { modalBoxStyle } from "../../constant/styles";
import { useDispatch } from "react-redux";
import { emitError, emitSuccess } from "../../redux/slices/alertSlice";
import EastIcon from "@mui/icons-material/East";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useFormik } from "formik";

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

export const SellBoxModal = ({ isSelling, handleClose, saleData, queryData }) => {
    const [sellingStep, setSellingStep] = useState(Steps.initializeSale);
    const navigate = useNavigate();

    const {
        fetch: fetchApprove,
        isLoading: isLoadingApprove,
        data: dataApprove,
    } = useWeb3ExecuteFunction();
    const {
        fetch: fetchCreate,
        isLoading: isLoadingCreate,
        data: dataCreate,
    } = useWeb3ExecuteFunction();

    const {
        data: approveData,
        startPolling: startPollingApprove,
        stopPolling: stopPollingApprove,
    } = useQuery(GET_APPROVAL, {
        variables: {
            id: saleData.owner.toLowerCase() + "." + marketplaceAddress.toLowerCase(),
        },
    });
    const dispatch = useDispatch();

    const validationSchema = yup.object({
        sellAmount: yup.number().integer().min(1).max(saleData.maxBuying).required(),
        priceEach: yup.number().positive().max(9999).required(),
    });

    const formik = useFormik({
        initialValues: {
            sellAmount: "",
            priceEach: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        },
    });

    useEffect(() => {
        if (
            !formik.errors.sellAmount &&
            !formik.errors.priceEach &&
            formik.values.sellAmount !== "" &&
            formik.values.priceEach !== ""
        ) {
            if (sellingStep === Steps.initializeSale) {
                setSellingStep(Steps.approveBox);
            }
        } else {
            setSellingStep(Steps.initializeSale);
        }
    }, [formik.errors.sellAmount, formik.errors.priceEach]);

    useEffect(() => {
        if (approveData && approveData.approval) {
            if (approveData.approval.approved) {
                if (sellingStep === Steps.approveBox) {
                    setSellingStep(Steps.createSale);
                }
            } else {
                if (sellingStep === Steps.createSale) {
                    setSellingStep(Steps.approveBox);
                }
            }
        }
    }, [approveData, sellingStep]);

    const handleSubmit = (values) => {
        if (sellingStep === Steps.approveBox) {
            fetchApprove({
                params: {
                    abi: mysteryBoxAbi,
                    contractAddress: mysteryBoxAddress,
                    functionName: "setApprovalForAll",
                    params: {
                        operator: marketplaceAddress,
                        approved: true,
                    },
                },
                onSuccess: (result) => {
                    startPollingApprove(1000);
                    result.wait().then(() => {
                        dispatch(emitSuccess({ content: "Approve Transaction completed!" }));
                        setTimeout(() => {
                            stopPollingApprove();
                        }, 3000);
                    });
                },
                onError: (error) => {
                    console.log(error);
                },
            });
            return;
        }
        if (sellingStep === Steps.createSale) {
            fetchCreate({
                params: {
                    abi: marketplaceAbi,
                    contractAddress: marketplaceAddress,
                    functionName: "createSale",
                    params: {
                        boxId: saleData.boxId,
                        amount: values.sellAmount.toString(),
                        priceEach: ethersUtils.parseEther(values.priceEach.toString()),
                    },
                },
                onSuccess: (result) => {
                    queryData.startPolling(1000);
                    result.wait().then(() => {
                        dispatch(emitSuccess({ content: "Transaction completed!" }));
                        setSellingStep(Steps.completed + 1);
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
            return;
        }
    };

    return (
        <Modal open={isSelling} onClose={handleClose}>
            <Box sx={{ ...modalBoxStyle }}>
                <Typography variant="h4">Sell Box</Typography>
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
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        label="Sell Amount"
                        type="number"
                        fullWidth
                        sx={{ mt: 6 }}
                        disabled={isLoadingCreate || sellingStep > Steps.createSale}
                        id="sellAmount"
                        name="sellAmount"
                        value={formik.values.sellAmount}
                        onChange={formik.handleChange}
                        error={formik.touched.sellAmount && Boolean(formik.errors.sellAmount)}
                        helperText={formik.touched.sellAmount && formik.errors.sellAmount}
                    />
                    <TextField
                        label="Price Each"
                        type="number"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={isLoadingCreate || sellingStep > Steps.createSale}
                        id="priceEach"
                        name="priceEach"
                        value={formik.values.priceEach}
                        onChange={formik.handleChange}
                        error={formik.touched.priceEach && Boolean(formik.errors.priceEach)}
                        helperText={formik.touched.priceEach && formik.errors.priceEach}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-around", mt: 6 }}>
                        {sellingStep < Steps.completed ? (
                            <>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{ mr: 2 }}
                                    disabled={
                                        isLoadingApprove ||
                                        isLoadingCreate ||
                                        sellingStep > Steps.createSale ||
                                        !!dataCreate
                                    }
                                    type="submit"
                                >
                                    {sellingStep === Steps.approveBox ? "Approve" : "Create"}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    fullWidth
                                    disabled={!!dataCreate}
                                    onClick={handleClose}
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
                                        navigate("/selling?seller=user");
                                    }}
                                    sx={{ mr: 2 }}
                                    endIcon={<EastIcon />}
                                >
                                    Marketplace
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
