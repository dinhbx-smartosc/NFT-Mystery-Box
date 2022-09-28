import {
    Box,
    Container,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import { Banner } from "../../components/Banner";
import { OwnedSale } from "../../components/OwnedSale/OwnedSale";
import { OthersSale } from "../../components/OthersSale/OthersSale";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SaleSortSelector } from "../../components/SaleSortSelector/SaleSortSelector";
import { SortType } from "../../constant/sortType";
import { useSelector } from "react-redux";
import { EmptyAlert } from "../../components/EmptyAlert";
import { WithdrawButton } from "../../components/WitdrawButton/WithdrawButton";

const Seller = {
    others: "others",
    user: "user",
};

export const SellingBox = () => {
    
    const [searchParams, setSearchParams] = useSearchParams();
    const [seller, setSeller] = useState(() => {
        const sellerParam = searchParams.getAll("seller");
        if (!sellerParam.length || sellerParam[0] === Seller.others) {
            return Seller.others;
        } else if (sellerParam.length && sellerParam[0] === Seller.user) {
            return Seller.user;
        }
    });
    const [sortType, setSortType] = useState(SortType.newest);

    const account = useSelector((state) => state.account.address);

    useEffect(() => {
        if (
            seller === Seller.user ||
            (seller === Seller.others && searchParams.getAll("seller").length)
        ) {
            setSearchParams({ seller: seller });
        }
    }, [seller]);

    return (
        <>
            <Banner image={"/images/banner1.jpg"} content={"SELLING BOX"} />
            <Container>
                <Box
                    sx={{
                        py: 3,
                        minHeight: "50vh",
                    }}
                >
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
                            <SaleSortSelector sortType={sortType} setSortType={setSortType} />
                        ) : (
                            !!account && (
                                <WithdrawButton />
                            )
                        )}
                    </Box>
                    {seller === Seller.others ? (
                        <OthersSale sortType={sortType} />
                    ) : account ? (
                        <OwnedSale />
                    ) : (
                        <EmptyAlert content="You have not connected wallet" />
                    )}
                </Box>
                {/* {isWithdrawing && (
                    <WithdrawModal
                        isOpen={isWithdrawing}
                        handleClose={() => setWithdrawing(false)}
                    />
                )} */}
            </Container>
        </>
    );
};