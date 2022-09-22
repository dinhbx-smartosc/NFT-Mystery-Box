import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea, CardActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { utils as ethersUtils } from "ethers";
import { BuyingBox } from "../BuyingBox";

const SellingBoxCard = ({ data, queryData }) => {
    const navigate = useNavigate();
    const [boxData, setBoxData] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const res = await axios.get(data.box.tokenURI);
            if (res.data) {
                setBoxData(res.data);
            }
        };
        if (!boxData) {
            loadData();
        }
    }, []);

    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardActionArea
                onClick={() => {
                    navigate(`/selling_detail/${data.id}`);
                }}
            >
                <CardMedia
                    component="img"
                    height="300"
                    image={boxData?.image}
                    sx={{ objectFit: "cover" }}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div" noWrap>
                        {boxData?.name}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography gutterBottom variant="subtitle1" component="div">
                            {`${ethersUtils.formatEther(data.priceEach)}ETH`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {`Amount: ${data.quantity}`}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
            <CardActions sx={{ m: 1 }}>
                <BuyingBox
                    saleId={data.id}
                    priceEach={data.priceEach}
                    queryData={queryData}
                    maxBuying={data.quantity}
                />
            </CardActions>
        </Card>
    );
};

export default SellingBoxCard;
