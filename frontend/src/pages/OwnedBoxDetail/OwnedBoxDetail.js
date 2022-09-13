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
import Counter from "../../components/Counter";
import NftCarousel from "../../components/NftCarousel/NftCarousel";
import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import axios from "axios";

const GET_BOX_DETAIL = gql`
    query GetBoxDetail($id: String) {
        boxBalance(id: $id) {
            balance
            box {
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
    const [boxData, setBoxData] = useState(null);
    const [nfts, setNfts] = useState(null);

    const { loading, error, data } = useQuery(GET_BOX_DETAIL, { variables: { id } });

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

    return (
        <Container>
            <Box
                sx={{
                    py: 3,
                }}
            >
                <Card sx={{ display: "flex", p: 5 }}>
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
                                <Counter />
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ flex: 2, marginLeft: 1 }}
                                >
                                    Open
                                </Button>
                            </Box>
                        </CardActions>
                    </Box>
                </Card>
            </Box>
            {nfts ? <NftCarousel nfts={nfts}></NftCarousel> : <></>}
        </Container>
    );
};

export default OwnedBoxDetail;
