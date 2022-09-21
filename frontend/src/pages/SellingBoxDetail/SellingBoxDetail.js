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
import Counter from "../../components/Counter/Counter";
import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import axios from "axios";
import { utils as ethersUtils } from "ethers";
import { BuyingBox } from "../../components/BuyingBox";
import { NftCarousel } from "../../components/NftCarousel";

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

const SellingBoxDetail = () => {

    const { id } = useParams();
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
                            <Typography gutterBottom variant="h5" component="div">
                                {`${data ? ethersUtils.formatEther(data.sale.priceEach) : 0}ETH`}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                {`Amount: ${data?.sale.quantity}`}
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
                            <BuyingBox
                                saleId={id}
                                priceEach={data?.sale.priceEach}
                                queryData={{ startPolling, stopPolling }}
                            />
                        </CardActions>
                    </Box>
                </Card>
            </Box>
            {nfts && <NftCarousel nfts={nfts}></NftCarousel>}
        </Container>
    );
};

export default SellingBoxDetail;
export { SellingBoxDetail as BoxDetails };
