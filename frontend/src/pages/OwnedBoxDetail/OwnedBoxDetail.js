import {
    Box,
    Container,
    Typography,
    Card,
    CardMedia,
    CardContent,
    CardActions,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import axios from "axios";
import { SellBoxButton } from "../../components/SellBoxButton";
import { NftCarousel } from "../../components/NftCarousel";
import { OpenBoxButton } from "../../components/OpenBoxButton";

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

export const OwnedBoxDetail = () => {
    const { id } = useParams();
    const { loading, error, data, startPolling, stopPolling } = useQuery(GET_BOX_DETAIL, {
        variables: { id },
    });
    const [boxData, setBoxData] = useState(null);
    const [nfts, setNfts] = useState(null);

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
                <Card sx={{ display: "flex", p: 5 }} variant="outlined">
                    <CardMedia
                        sx={{ flex: 5, maxWidth: "50%" }}
                        component="img"
                        image={boxData?.image}
                        
                    />
                    <Box
                        sx={{
                            flex: 5,
                            px: 5,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
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
                        <CardActions sx={{ mt: 5, display: "block", mb: 2 }}>
                            <OpenBoxButton
                                boxId={data?.boxBalance.box.boxId}
                                queryData={{ startPolling, stopPolling }}
                                maxOpen={data?.boxBalance.balance}
                            />
                            <SellBoxButton
                                saleData={{
                                    owner: id.split(".")[0],
                                    boxId: data?.boxBalance.box.boxId,
                                    maxBuying: data?.boxBalance.balance,
                                }}
                                queryData={{ startPolling, stopPolling }}
                            />
                        </CardActions>
                    </Box>
                </Card>
            </Box>
            {nfts ? <NftCarousel nfts={nfts}></NftCarousel> : <></>}
        </Container>
    );
};
