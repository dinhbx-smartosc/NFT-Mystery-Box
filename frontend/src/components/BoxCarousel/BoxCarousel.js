import { gql, useLazyQuery } from "@apollo/client";
import { Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HomeBoxCard } from "./HomeBoxCard";

const GET_SALES = gql`
    query GetSales($seller: String) {
        sales(orderBy: id, orderDirection: desc, where: { quantity_gt: "0", seller_not: $seller }) {
            box {
                id
                boxId
                tokenURI
            }
            id
            priceEach
            quantity
            saleId
            seller
        }
    }
`;

export const BoxCarousel = () => {
    const [getSales, { data: salesData, loading: loadingSales, error: loadSalesError }] =
        useLazyQuery(GET_SALES);
    const account = useSelector((state) => state.account.address);
    const navigate = useNavigate();

    useEffect(() => {
        getSales({
            variables: {
                seller: account ? account.toLowerCase() : "",
            },
        });
    }, [account]);

    if (loadingSales || loadSalesError || !salesData) return <></>;

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h4">Recently Listed</Typography>
                <Typography
                    variant="body1"
                    color="info.main"
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                        navigate("/selling");
                    }}
                >
                    See more&#187;
                </Typography>
            </Box>
            <Stack
                className="nftStack"
                direction="row"
                spacing={2}
                sx={{ overflowX: "auto", py: 1, mt: 2 }}
            >
                {salesData.sales.map((item) => (
                    <HomeBoxCard id={item.id} saleData={item} />
                ))}
            </Stack>
        </Box>
    );
};
