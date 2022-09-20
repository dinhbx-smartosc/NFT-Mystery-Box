import {
    Box,
    Container,
    Typography,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import NftCarousel from "../../components/NftCarousel/NftCarousel";
import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useWeb3ExecuteFunction } from "react-moralis";
import mysteryBoxAbi from "../../constant/abi/MysteryBox.json";
import { mysteryBoxAddress } from "../../constant/contractAddresses";
import { SellBoxModal } from "../../components/SellBoxModal";
import { Counter } from "../../components/Counter";

const GET_BOX_DETAIL = gql`
    query GetBoxDetail($id: String) {
        boxBalance(id: $id) {
            balance
            box {
                boxId
                tokenURI
                leftNFT {
                    address
                    tokenId
                }
                openedNFT {
                    address
                    tokenId
                }
            }
        }
    }
`;

const OwnedBoxDetail = () => {
    const { id } = useParams();
    const { loading, error, data, startPolling, stopPolling } = useQuery(GET_BOX_DETAIL, {
        variables: { id },
    });
    const [boxData, setBoxData] = useState(null);
    const [nfts, setNfts] = useState(null);
    const [openAmount, setOpenAmount] = useState(0);
    const [isSelling, setSelling] = useState(false);

    const { fetch: fetchOpen, isFetching: isFetchingOpen } = useWeb3ExecuteFunction({
        abi: mysteryBoxAbi,
        contractAddress: mysteryBoxAddress,
        functionName: "openBox",
        params: {
            boxId: data?.boxBalance.box.boxId,
            amount: openAmount,
        },
    });

    useEffect(() => {
        const loadBoxData = async () => {
            const res = await axios.get(data.boxBalance.box.tokenURI);
            if (res.data) {
                setBoxData(res.data);
            }
        };
        if (data && !boxData) {
            loadBoxData();
        }
        if (data) {
            const nftData = [];
            const leftNfts = data.boxBalance.box.leftNFT.map((item) => ({
                ...item,
                opened: false,
            }));
            const openedNfts = data.boxBalance.box.openedNFT.map((item) => ({
                ...item,
                opened: true,
            }));
            nftData.push(...leftNfts, ...openedNfts);
            setNfts(nftData);
        }
    }, [data]);

    const handleOpen = () => {
        fetchOpen();
    };

    return (
        <Container>
            <Box
                sx={{
                    py: 3,
                }}
            >
                <Card sx={{ display: "flex", p: 5 }} variant="outlined">
                    <CardMedia
                        sx={{ flex: 5, maxWidth: "50%" }}
                        component="img"
                        image={boxData?.image}
                        alt="green iguana"
                    />
                    <Box
                        sx={{
                            flex: 5,
                            px: 5,
                        }}
                    >
                        <CardContent>
                            <Typography gutterBottom variant="h4" component="div">
                                {boxData?.name}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                {`Owned: ${data?.boxBalance.balance}`}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ marginTop: 5 }}
                            >
                                {boxData?.description}
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ my: 5 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "end",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Counter number={openAmount} setNumber={setOpenAmount} />
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ flex: 2, marginLeft: 1 }}
                                    onClick={handleOpen}
                                    disabled={isFetchingOpen}
                                >
                                    Open
                                </Button>
                            </Box>
                        </CardActions>
                        <CardActions sx={{ my: 5 }}>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => setSelling(true)}
                            >
                                Send to marketplace
                            </Button>
                        </CardActions>
                    </Box>
                </Card>
            </Box>
            {nfts ? <NftCarousel nfts={nfts}></NftCarousel> : <></>}
            {isSelling && (
                <SellBoxModal
                    owner={id.split(".")[0]}
                    boxId={data?.boxBalance.box.boxId}
                    isSelling={isSelling}
                    handleClose={() => setSelling(false)}
                    queryData={{ startPolling, stopPolling }}
                />
            )}
        </Container>
    );
};

export default OwnedBoxDetail;
