/* global BigInt */
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useSelector } from "react-redux";
import { SortType } from "../../constant/sortType";
import { OthersSaleCard } from "../OthersSaleCard";
import { utils as ethersUtils } from "ethers";

const GET_OTHER_SALES = gql`
    query GetOthersSales($seller: String) {
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

export const OthersSale = () => {
    const { account } = useMoralis();
    const [
        getOthersSales,
        {
            data: salesData,
            loading: loadingSales,
            error: loadSalesError,
            startPolling,
            stopPolling,
        },
    ] = useLazyQuery(GET_OTHER_SALES);
    const [sortedSales, setSortedSales] = useState(null);

    const sortType = useSelector((state) => state.sortType.saleSortType);

    useEffect(() => {
        if (account) {
            getOthersSales({
                variables: {
                    seller: account.toLowerCase(),
                },
            });
        }
    }, [account]);

    useEffect(() => {
        if (salesData && salesData.sales) {
            if (sortType === SortType.newest) {
                setSortedSales([...salesData.sales]);
            } else if (sortType === SortType.priceAscending) {
                const sortedData = [...salesData.sales].sort((a, b) => {
                    const aPrice = ethersUtils.formatEther(a.priceEach);
                    const bPrice = ethersUtils.formatEther(b.priceEach);
                    return aPrice - bPrice;
                });
                setSortedSales(sortedData);
            } else if (sortType === SortType.priceDescending) {
                const sortedData = [...salesData.sales].sort((a, b) => {
                    const aPrice = ethersUtils.formatEther(a.priceEach);
                    const bPrice = ethersUtils.formatEther(b.priceEach);
                    return bPrice - aPrice;
                });
                setSortedSales(sortedData);
            }
        }
    }, [sortType]);

    if (loadingSales || loadSalesError || !salesData) return <></>;

    return (
        <Grid container spacing={2}>
            {sortedSales?.map((item) => (
                <Grid item xs={3} key={item.id}>
                    <OthersSaleCard
                        data={item}
                        queryData={{ startPolling, stopPolling }}
                    ></OthersSaleCard>
                </Grid>
            ))}
        </Grid>
    );
};
