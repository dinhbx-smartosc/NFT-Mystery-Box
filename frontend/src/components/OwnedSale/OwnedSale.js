import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Grid } from "@mui/material";
import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { OwnedSaleCard } from "../OwedSaleCard";

const GET_OWNED_SALES = gql`
    query GetOwnedSales($seller: String) {
        sales(orderBy: id, orderDirection: desc, where: { quantity_gt: "0", seller: $seller }) {
            box {
                id
                boxId
                tokenURI
            }
            id
            priceEach
            quantity
            saleId
        }
    }
`;

export const OwnedSale = () => {
    const { account } = useMoralis();
    const [
        getOwnedSales,
        {
            data: salesData,
            loading: loadingSales,
            error: loadSalesError,
            startPolling,
            stopPolling,
        },
    ] = useLazyQuery(GET_OWNED_SALES);

    useEffect(() => {
        if (account) {
            getOwnedSales({
                variables: {
                    seller: account.toLowerCase(),
                },
            });
        }
    }, [account]);

    if (loadingSales || loadSalesError || !salesData) return <></>;

    return (
        <Grid container spacing={2}>
            {salesData.sales.map((item) => (
                <Grid item xs={3} key={item.id}>
                    <OwnedSaleCard
                        data={item}
                        queryData={{ startPolling, stopPolling }}
                    ></OwnedSaleCard>
                </Grid>
            ))}
        </Grid>
    );
};
