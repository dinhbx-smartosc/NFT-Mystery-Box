import { Button, Modal, Box, Typography, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useWeb3ExecuteFunction } from "react-moralis";
import { utils as ethersUtils } from "ethers";
import { DoNotDisturbAlt, TaskAlt } from "@mui/icons-material";
import nftAbi from "../../constant/abi/NFT.json";
import { useSelector } from "react-redux";
import { mysteryBoxAddress } from "../../constant/contractAddresses";
import CircularProgress from "@mui/material/CircularProgress";
import { LoadingButton } from "@mui/lab";

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

const ApprovedState = {
    notLoad: "notLoad",
    loading: "loading",
    approved: "approved",
    notApproved: "notApproved",
};

const generateApprove = (approvedState) => {
    if (approvedState === ApprovedState.notLoad) {
        return <></>;
    }
    if (approvedState === ApprovedState.loading) {
        return <CircularProgress sx={{ mt: 5, mx: "auto", display: "block" }} />;
    }
    if (approvedState === ApprovedState.approved) {
        return (
            <Box sx={{ mt: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TaskAlt sx={{ fontSize: 50 }} color="success" />
                <Typography sx={{ fontSize: 30 }}>Approved</Typography>
            </Box>
        );
    }
    if (approvedState === ApprovedState.notApproved) {
        return (
            <Box sx={{ mt: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DoNotDisturbAlt sx={{ fontSize: 50 }} color="error" />
                <Typography sx={{ fontSize: 30 }}>Not Approved</Typography>
            </Box>
        );
    }
};

export const AddNftModal = ({ listNfts, setListNfts, isOpen, handleClose }) => {
    
    const account = useSelector((state) => state.account.address);
    const [nftAddress, setNftAddress] = useState("");
    const [tokenId, setTokenId] = useState("");
    const [approved, setApproved] = useState(ApprovedState.notLoad);
    const { fetch: fetchApproved } = useWeb3ExecuteFunction();
    const { fetch: approve, isLoading: loadingApprove } = useWeb3ExecuteFunction();

    useEffect(() => {
        if (ethersUtils.isAddress(nftAddress) && tokenId !== "" && !isNaN(tokenId)) {
            setApproved(ApprovedState.loading);
            fetchApproved({
                params: {
                    abi: nftAbi,
                    contractAddress: nftAddress,
                    functionName: "getApproved",
                    params: {
                        tokenId: tokenId,
                    },
                },
                onSuccess: (result) => {
                    if (result?.toLowerCase() === mysteryBoxAddress.toLowerCase()) {
                        setApproved(ApprovedState.approved);
                    } else {
                        setApproved(ApprovedState.notApproved);
                    }
                },
                onError: (error) => {
                    console.log(error);
                },
            });
        } else {
            setApproved(ApprovedState.notLoad);
        }
    }, [nftAddress, tokenId]);

    const handleAddress = (e) => {
        const value = e.target.value;
        setNftAddress(value);
    };

    const handleTokenId = (e) => {
        const value = e.target.value;
        setTokenId(value);
    };

    const handleConfirm = () => {
        if (approved === ApprovedState.approved) {
            if (listNfts.every((nft) => nft.address !== nftAddress || nft.tokenId !== tokenId)) {
                setListNfts((prev) => [...prev, { address: nftAddress, tokenId: tokenId }]);
                handleClose();
            }
        }
    };

    const handleApprove = () => {
        if (approved === ApprovedState.notApproved) {
            setApproved(ApprovedState.loading);
            approve({
                params: {
                    abi: nftAbi,
                    contractAddress: nftAddress,
                    functionName: "approve",
                    params: {
                        to: mysteryBoxAddress,
                        tokenId: tokenId,
                    },
                },
                onSuccess: (result) => {
                    result.wait().then(() => {
                        setApproved(ApprovedState.approved);
                    });
                },
                onError: (error) => {
                    setApproved(ApprovedState.notApproved);
                    console.log(error);
                },
            });
        }
    };

    return (
        <>
            <Modal open={isOpen} onClose={handleClose} sx={{ zIndex: "tooltip" }}>
                <Box sx={{ ...style }}>
                    <Typography variant="h4">Add NFT</Typography>
                    <TextField
                        label="Contract Address"
                        type="text"
                        fullWidth
                        sx={{ mt: 6 }}
                        value={nftAddress}
                        onChange={handleAddress}
                    />
                    <TextField
                        label="Token ID"
                        type="number"
                        fullWidth
                        sx={{ mt: 2 }}
                        value={tokenId}
                        onChange={handleTokenId}
                    />
                    {generateApprove(approved)}
                    <Box sx={{ display: "flex", justifyContent: "space-around", mt: 6 }}>
                        {approved === ApprovedState.notApproved ? (
                            <LoadingButton
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{ mr: 2 }}
                                onClick={handleApprove}
                                loading={loadingApprove && !approved.loading}
                            >
                                Approve
                            </LoadingButton>
                        ) : (
                            <LoadingButton
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{ mr: 2 }}
                                onClick={handleConfirm}
                                disabled={approved !== ApprovedState.approved}
                                loading={approved === ApprovedState.loading}
                            >
                                Confirm
                            </LoadingButton>
                        )}
                        <Button variant="outlined" size="large" fullWidth onClick={handleClose}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};
