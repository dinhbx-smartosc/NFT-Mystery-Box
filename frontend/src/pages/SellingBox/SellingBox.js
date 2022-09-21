import {
    Grid,
    Box,
    Container,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Select,
    MenuItem,
    Button,
} from "@mui/material";
import SellingBoxCard from "../../components/SellingBoxCard/SellingBoxCard";
import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { OwnedSaleCard } from "../../components/OwedSaleCard";
import { WithdrawModal } from "../../components/WithdrawModal";
import { Image } from "mui-image";

const GET_SELLING_BOXES = gql`
    query GetSellingBoxes {
        sales(where: { quantity_gt: "0" }) {
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

const Seller = {
    others: "others",
    user: "user",
};

const SellingBox = () => {
    const { account } = useMoralis();
    const { loading, error, data, startPolling, stopPolling } = useQuery(GET_SELLING_BOXES);
    const [sales, setSales] = useState([]);
    const [seller, setSeller] = useState(Seller.others);
    const [isWithdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        if (typeof window.ethereum !== "undefined") {
            window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
                if (accounts.length) {
                    if (data && data?.sales && account) {
                        if (seller === Seller.others) {
                            const othersSales = data.sales.filter(
                                (sale) => sale.seller !== account.toLowerCase()
                            );
                            setSales(othersSales);
                        } else if (seller === Seller.user) {
                            const userSales = data.sales.filter(
                                (sale) => sale.seller === account.toLowerCase()
                            );
                            setSales(userSales);
                        }
                    }
                } else {
                    console.log("called else");
                    if (seller === Seller.others) {
                        setSales(data.sales);
                    } else if (seller === Seller.user) {
                        setSales([]);
                    }
                }
            });
        }
    }, [data, seller, account]);

    const handleWithdraw = () => {
        setWithdrawing(true);
    };

    return (
        <>
            <Container>
                <Box
                    sx={{
                        py: 3,
                    }}
                >
                    <Typography variant="h4" sx={{ py: 3 }}>
                        Selling Boxes
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            my: 3,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography sx={{ mr: 3 }}>Sold by</Typography>
                            <RadioGroup
                                row
                                value={seller}
                                onChange={(_, newValue) => {
                                    setSeller(newValue);
                                }}
                            >
                                <FormControlLabel
                                    value={Seller.others}
                                    control={<Radio size="small" />}
                                    label="Others"
                                />
                                <FormControlLabel
                                    value={Seller.user}
                                    control={<Radio size="small" />}
                                    label="You"
                                />
                            </RadioGroup>
                        </Box>

                        {seller === Seller.others ? (
                            <Select
                                size="small"
                                sx={{ width: 120, height: 40, ml: 5 }}
                                displayEmpty
                                value={10}
                            >
                                <MenuItem value={10}>Newest</MenuItem>
                                <MenuItem value={20}>
                                    <span>Price</span>
                                    <span
                                        style={{
                                            fontSize: 25,
                                            fontWeight: "bolder",
                                            margin: 0,
                                            padding: 0,
                                        }}
                                    >
                                        &uarr;
                                    </span>
                                </MenuItem>
                                <MenuItem value={20}>
                                    <span>Price</span>
                                    <span
                                        style={{
                                            fontSize: 25,
                                            fontWeight: "bolder",
                                            margin: 0,
                                            padding: 0,
                                        }}
                                    >
                                        &darr;
                                    </span>
                                </MenuItem>
                            </Select>
                        ) : (
                            <Button
                                size="medium"
                                variant="outlined"
                                color="success"
                                onClick={handleWithdraw}
                            >
                                Withdraw
                            </Button>
                        )}
                    </Box>
                    <Grid container spacing={2}>
                        {sales.map((item) => (
                            <Grid item xs={3} key={item.id}>
                                {seller === Seller.others ? (
                                    <SellingBoxCard
                                        data={item}
                                        queryData={{ startPolling, stopPolling }}
                                    ></SellingBoxCard>
                                ) : (
                                    <OwnedSaleCard
                                        data={item}
                                        queryData={{ startPolling, stopPolling }}
                                    ></OwnedSaleCard>
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                {isWithdrawing && (
                    <WithdrawModal
                        isOpen={isWithdrawing}
                        handleClose={() => setWithdrawing(false)}
                        queryData={{ startPolling, stopPolling }}
                    />
                )}
            </Container>
        </>
    );
};

export default SellingBox;
export { SellingBox };
