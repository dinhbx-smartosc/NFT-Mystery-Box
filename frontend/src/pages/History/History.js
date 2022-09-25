import { gql, useLazyQuery } from "@apollo/client";
import { Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { OpenAccordion } from "../../components/OpenAccordion/OpenAccordion";
import { Banner } from "../../components/Banner";
import { EmptyAlert } from "../../components/EmptyAlert/EmptyAlert";
import { useSelector } from "react-redux";

const GET_OPEN_DATA = gql`
    query QueryOpenData($opener: String) {
        openRequests(where: { opener: $opener }) {
            amount
            completed
            openedNFT {
                address
                tokenId
            }
            requestId
            box {
                tokenURI
            }
        }
    }
`;

export const History = () => {
    const [getOpenData, { data: openData, loading: loadingOpenData }] = useLazyQuery(GET_OPEN_DATA);
    const account = useSelector((state) => state.account.address);

    useEffect(() => {
        if (account) {
            getOpenData({
                variables: {
                    opener: account.toLowerCase(),
                },
                pollInterval: 1000,
            });
        }
    }, [account]);

    if (!account) {
        return (
            <>
                <Banner image={"/images/banner3.jpeg"} content={"OPEN HISTORY"} />
                <Container>
                    <Box
                        sx={{
                            py: 3,
                            minHeight: "50vh",
                        }}
                    >
                        <EmptyAlert content={"You have not connected wallet"} />
                    </Box>
                </Container>
            </>
        );
    }

    if (loadingOpenData || !openData) {
        return <></>;
    }

    return (
        <>
            <Banner image={"/images/banner3.jpeg"} content={"OPEN HISTORY"} />
            <Container>
                <Box
                    sx={{
                        py: 3,
                        minHeight: "50vh",
                    }}
                >
                    {openData.openRequests.length ? (
                        [...openData.openRequests]
                            .reverse()
                            .map((item) => <OpenAccordion data={item} />)
                    ) : (
                        <EmptyAlert content={"You have not open any box"} />
                    )}
                </Box>
            </Container>
        </>
    );
};
