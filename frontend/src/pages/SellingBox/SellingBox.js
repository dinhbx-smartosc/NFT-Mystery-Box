import { Grid, Box, Container, Typography } from "@mui/material";
import SellingBoxCard from "../../components/SellingBoxCard/SellingBoxCard";
import { useQuery, gql } from "@apollo/client";

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
        }
    }
`;

const SellingBox = () => {
    const { loading, error, data, startPolling, stopPolling } = useQuery(GET_SELLING_BOXES);

    return (
        <Container>
            <Box
                sx={{
                    py: 3,
                }}
            >
                <Typography variant="h4" sx={{ py: 3 }}>
                    Selling Boxes
                </Typography>
                <Grid container spacing={2}>
                    {data?.sales.map((item) => (
                        <Grid item xs={3} key={item.id}>
                            <SellingBoxCard
                                data={item}
                                queryData={{ startPolling, stopPolling }}
                            ></SellingBoxCard>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default SellingBox;
export { SellingBox };
