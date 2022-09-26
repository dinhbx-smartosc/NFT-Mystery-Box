import { Button, Paper, TextField, Typography } from "@mui/material";
import { Banner } from "../../components/Banner";
import { Box, Container } from "@mui/system";
import { useState } from "react";
import { AddNft } from "../../components/AddNft/AddNft";
import { CreateBoxButton } from "../../components/AddNft/CreateBoxButton";
import { useSelector } from "react-redux";
import { EmptyAlert } from "../../components/EmptyAlert";

export const CreateBox = () => {
    const account = useSelector((state) => state.account.address);
    const [tokenUri, setTokenUri] = useState("");
    const [listNfts, setListNfts] = useState([]);

    const handleUri = (e) => {
        const value = e.target.value;
        setTokenUri(value);
    };

    return (
        <>
            <Banner image={"/images/banner4.jpeg"} content={"CREATE BOX"} />
            <Container>
                <Box
                    sx={{
                        py: 3,
                        minHeight: "50vh",
                    }}
                >
                    {account ? (
                        <Paper sx={{ p: 5 }} variant="outlined">
                            <Typography variant="h4">New Box Info</Typography>
                            <Box
                                sx={{
                                    width: "70%",
                                    mx: "auto",
                                }}
                            >
                                <TextField
                                    label="Box Metadata URI"
                                    type="url"
                                    fullWidth
                                    sx={{ mt: 7 }}
                                    value={tokenUri}
                                    onChange={handleUri}
                                />
                                <AddNft listNfts={listNfts} setListNfts={setListNfts} />
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-around",
                                        mt: 5,
                                        mb: 2,
                                    }}
                                >
                                    <CreateBoxButton
                                        nftAddresses={listNfts.map((nft) => nft.address)}
                                        tokenIds={listNfts.map((nft) => nft.tokenId)}
                                        tokenUri={tokenUri}
                                    />
                                    <Button variant="outlined" size="large" fullWidth>
                                        Clear
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    ) : (
                        <EmptyAlert content={"You have not connected wallet"} />
                    )}
                </Box>
            </Container>
        </>
    );
};
