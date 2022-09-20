import { Grid, Box, Container, Typography } from "@mui/material";
import OwnedBoxCard from "../../components/OwnedBoxCard/OwnedBoxCard";
import { useQuery, gql } from "@apollo/client";
import { useMoralis } from "react-moralis";

const GET_OWED_BOXES = gql`
    query GetOwnedBoxes($account: String) {
        boxBalances(where: { owner: $account, balance_gt: "0" }) {
            id
            balance
            box {
                tokenURI
            }
        }
    }
`;

const OwnedBox = () => {
    const { account } = useMoralis();

    const { loading, error, data } = useQuery(GET_OWED_BOXES, { variables: { account }, fetchPolicy: "cache-and-network" });

    return (
        <Container>
            <Box
                sx={{
                    py: 3,
                }}
            >
                <Typography variant="h4" sx={{ py: 3 }}>
                    Owned Boxes
                </Typography>
                <Grid container spacing={2}>
                    {data ? (
                        data.boxBalances.map((item) => (
                            <Grid item xs={3} key={item.id}>
                                <OwnedBoxCard
                                    data={{
                                        id: item.id,
                                        balance: item.balance,
                                        tokenURI: item.box.tokenURI,
                                    }}
                                />
                            </Grid>
                        ))
                    ) : (
                        <div></div>
                    )}
                </Grid>
            </Box>
        </Container>
    );
};

export default OwnedBox;
