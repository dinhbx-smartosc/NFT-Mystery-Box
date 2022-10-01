import { Grid, Box, Container, Typography } from "@mui/material";
import { useQuery, gql } from "@apollo/client";
import { useMoralis } from "react-moralis";
import { OwnedBoxCard } from "../../components/OwnedBoxCard";
import { Banner } from "../../components/Banner";
import { Footer } from "../../components/Footer";
import { useSelector } from "react-redux";
import { EmptyAlert } from "../../components/EmptyAlert";

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

export const OwnedBox = () => {
    const account = useSelector((state) => state.account.address);
    const { loading, error, data } = useQuery(GET_OWED_BOXES, {
        variables: { account },
        fetchPolicy: "cache-and-network",
    });

    return (
        <>
            <Banner image={"/images/banner2.jpeg"} content={"OWNED BOX"} />
            <Container>
                <Box
                    sx={{
                        py: 3,
                        minHeight: "50vh",
                    }}
                >
                    {account ? (
                        <Grid container spacing={2}>
                            {data &&
                                [...data.boxBalances].reverse().map((item) => (
                                    <Grid item xs={3} key={item.id}>
                                        <OwnedBoxCard
                                            data={{
                                                id: item.id,
                                                balance: item.balance,
                                                tokenURI: item.box.tokenURI,
                                            }}
                                        />
                                    </Grid>
                                ))}
                        </Grid>
                    ) : (
                        <EmptyAlert content={"You have not connected wallet"} />
                    )}
                </Box>
            </Container>
        </>
    );
};
