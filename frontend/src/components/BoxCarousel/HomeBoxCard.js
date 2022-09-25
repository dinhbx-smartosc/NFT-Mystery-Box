import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EthPrice } from "../EthPrice";
import { TooltipAddress } from "../TooltipAddress";

export const HomeBoxCard = ({ saleData }) => {
    const navigate = useNavigate();
    const [boxData, setBoxData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const res = await axios.get(saleData.box.tokenURI);
            if (res.data) {
                setBoxData(res.data);
            }
        };
        if (!boxData) {
            loadData();
        }
    }, []);

    return (
        <Card sx={{ minWidth: 270, maxWidth: 270, borderRadius: 5 }}>
            <CardActionArea
                onClick={() => {
                    navigate(`/selling_detail/${saleData.id}`);
                }}
            >
                <CardMedia
                    component="img"
                    height="270"
                    image={boxData?.image}
                    sx={{ objectFit: "cover" }}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div" noWrap>
                        {boxData?.name}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <EthPrice value={saleData.priceEach} />
                        <Typography variant="body2" color="text.secondary">
                            {`Amount: ${saleData.quantity}`}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ minWidth: 60, fontWeight: 450 }}>
                            Sold by:&nbsp;
                        </Typography>
                        <TooltipAddress address={saleData.seller} />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
