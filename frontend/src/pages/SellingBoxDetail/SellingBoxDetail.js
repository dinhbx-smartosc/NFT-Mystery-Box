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
import { BuyingBox } from "../../components/BuyingBox";
import { NftCarousel } from "../../components/NftCarousel";
import { useMoralis } from "react-moralis";
import { UpdatePriceButton } from "../../components/UpdatePriceButton";
import { CancelSaleButton } from "../../components/CancelSaleButton/CancelSaleButton";
import { EthPriceLarge } from "../../components/EthPrice";
import { TooltipAddress } from "../../components/TooltipAddress";

const GET_SALE_DETAIL = gql`
    query GetSaleDetail($id: String) {
        sale(id: $id) {
            box {
                leftNFT {
                    address
                    tokenId
                }
                openedNFT {
                    address
                    tokenId
                }
                tokenURI
            }
            priceEach
            quantity
            seller
        }
    }
`;

export const SellingBoxDetail = () => {
    const { id } = useParams();
    const { account } = useMoralis();
    const [boxData, setBoxData] = useState(null);
    const [nfts, setNfts] = useState(null);
    const { loading, error, data, startPolling, stopPolling } = useQuery(GET_SALE_DETAIL, {
        variables: { id },
    });

    useEffect(() => {
        const loadBoxData = async () => {
            const res = await axios.get(data.sale.box.tokenURI);
            if (res.data) {
                setBoxData(res.data);
            }
        };
        if (data && !boxData) {
            loadBoxData();
        }
        if (data) {
            const nftData = [];
            const leftNfts = data.sale.box.leftNFT.map((item) => ({
                ...item,
                opened: false,
            }));
            const openedNfts = data.sale.box.openedNFT.map((item) => ({
                ...item,
                opened: true,
            }));
            nftData.push(...leftNfts, ...openedNfts);
            setNfts(nftData);
        }
    }, [data]);

    if (loading || error || !data) {
        return <></>;
    }

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
                            <EthPriceLarge value={data.sale.priceEach} />
                            <Typography variant="subtitle2" color="text.secondary">
                                {`Amount: ${data?.sale.quantity}`}
                            </Typography>
                            <Box sx={{ display: "flex", flexGrow: 1 }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ minWidth: 60, fontWeight: 450 }}
                                >
                                    Sold by:&nbsp;
                                </Typography>
                                <TooltipAddress address={data.sale.seller} />
                            </Box>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ marginTop: 5 }}
                            >
                                {boxData?.description}
                            </Typography>
                        </CardContent>
                        <CardActions
                            sx={{
                                mt: 5,
                                mb: 2,
                            }}
                        >
                            {data.sale.seller === account?.toLowerCase() ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexGrow: 0.4,
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <UpdatePriceButton
                                        saleId={id}
                                        queryData={{ startPolling, stopPolling }}
                                    />
                                    <CancelSaleButton
                                        queryData={{ startPolling, stopPolling }}
                                        saleInfo={{ saleId: id, amount: data?.sale.quantity }}
                                    />
                                </Box>
                            ) : (
                                <BuyingBox
                                    saleId={id}
                                    priceEach={data?.sale.priceEach}
                                    queryData={{ startPolling, stopPolling }}
                                    maxBuying={data?.sale.quantity}
                                />
                            )}
                        </CardActions>
                    </Box>
                </Card>
            </Box>
            {nfts && <NftCarousel nfts={nfts}></NftCarousel>}
        </Container>
    );
};
