import { gql, useLazyQuery } from "@apollo/client";
import { Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import { useEffect } from "react";
import { useMoralis } from "react-moralis";
import { OpenAccordion } from "../../components/OpenAccordion/OpenAccordion";

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

export default function History() {
    const { account } = useMoralis();
    const [getOpenData, { data: openData, loading: loadingOpenData }] = useLazyQuery(GET_OPEN_DATA);

    useEffect(() => {
        if (account) {
            getOpenData({
                variables: {
                    opener: account.toLowerCase(),
                },
                pollInterval: 1000
            });
        }
    }, [account]);

    if (loadingOpenData || !openData) {
        return <></>;
    }

    return (
        <Container>
            <Box
                sx={{
                    py: 3,
                }}
            >
                {openData.openRequests.map((item) => (
                    <OpenAccordion data={item} />
                ))}
            </Box>
        </Container>
    );
}
