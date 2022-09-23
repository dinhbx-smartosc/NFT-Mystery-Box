import {
    Box,
    Container,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Select,
    MenuItem,
    Button,
    Paper,
} from "@mui/material";
import { WithdrawModal } from "../../components/WithdrawModal";
import { Banner } from "../../components/Banner";
import { OwnedSale } from "../../components/OwnedSale/OwnedSale";
import { OthersSale } from "../../components/OthersSale/OthersSale";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SaleSortSelector } from "../../components/SaleSortSelector/SaleSortSelector";
import { SortType } from "../../constant/sortType";

const Seller = {
    others: "others",
    user: "user",
};

const SellingBox = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [seller, setSeller] = useState(() => {
        const sellerParam = searchParams.getAll("seller");
        if (!sellerParam.length || sellerParam[0] === Seller.others) {
            return Seller.others;
        } else if (sellerParam.length && sellerParam[0] === Seller.user) {
            return Seller.user;
        }
    });
    const [isWithdrawing, setWithdrawing] = useState(false);
    const [sortType, setSortType] = useState(SortType.newest);

    useEffect(() => {
        setSearchParams({ seller: seller });
    }, [seller]);

    const handleWithdraw = () => {
        setWithdrawing(true);
    };

    return (
        <>
            <Banner
                image={"/images/banner1.jpg"}
                content={"SELLING BOX"}
            />
            <Container>
                <Box
                    sx={{
                        py: 3,
                        minHeight: "40vh",
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
                    {seller === Seller.others ? <OthersSale sortType={sortType} /> : <OwnedSale />}
                </Box>
                {isWithdrawing && (
                    <WithdrawModal
                        isOpen={isWithdrawing}
                        handleClose={() => setWithdrawing(false)}
                    />
                )}
            </Container>
            <Box
                sx={{
                    height: "30vh",
                    backgroundColor: "#1976d2",
                    mt: 10,
                }}
            ></Box>
        </>
    );
};

export default SellingBox;
export { SellingBox };
