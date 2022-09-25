import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, Button, CardActionArea, CardActions, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { utils as ethersUtils } from "ethers";
import { UpdatePriceModal } from "../UpdatePriceModal";
import { CancelSaleModal } from "../CancelSaleModal";
import { UpdatePriceButton } from "../UpdatePriceButton";
import { CancelSaleButton } from "../CancelSaleButton/CancelSaleButton";
import { EthPrice } from "../EthPrice";

const OwnedSaleCard = ({ data, queryData }) => {
    const navigate = useNavigate();
    const [boxData, setBoxData] = useState(null);
    const [isUpdating, setUpdating] = useState(false);
    const [isCanceling, setCanceling] = useState(false);

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
        <Card sx={{ maxWidth: 270 }}>
            <CardActionArea
                onClick={() => {
                    navigate(`/selling_detail/${data.id}`);
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
                        <EthPrice value={data.priceEach} />
                        <Typography variant="body2" color="text.secondary">
                            {`Amount: ${data.quantity}`}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
            <CardActions sx={{ m: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexGrow: 1,
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <UpdatePriceButton saleId={data.id} queryData={queryData} />
                    <CancelSaleButton
                        queryData={queryData}
                        saleInfo={{ saleId: data.id, amount: data.quantity }}
                    />
                </Box>
            </CardActions>
        </Card>
    );
};

export { OwnedSaleCard };
