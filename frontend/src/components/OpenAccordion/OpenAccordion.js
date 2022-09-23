import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Image from "mui-image";
import { OpenedNftCarousel } from "../OpenedNftCarousel/OpenedNftCarousel";
import { useEffect, useState } from "react";
import axios from "axios";

export const OpenAccordion = ({ data }) => {
    const [boxData, setBoxData] = useState(null);

    useEffect(() => {
        const fetchBoxData = async () => {
            const res = await axios.get(data.box.tokenURI);
            if (res.data) {
                setBoxData(res.data);
            }
        };

        if (!boxData) {
            fetchBoxData();
        }
    }, []);

    if (!boxData) {
        return <></>;
    }

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", flexGrow: 1 }}>
                    <Image src={boxData.image} width={100} height={100} sx={{ borderRadius: 1 }} />
                    <Box sx={{ ml: 1 }}>
                        <Typography variant="h5">{boxData.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {`Open amount: ${data.amount}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {`Status: ${data.completed ? "Completed" : "Pending"}`}
                        </Typography>
                    </Box>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                {data.completed ? (
                    <OpenedNftCarousel nfts={data.openedNFT} />
                ) : (
                    <Typography variant="h4">Pending...</Typography>
                )}
            </AccordionDetails>
        </Accordion>
    );
};
