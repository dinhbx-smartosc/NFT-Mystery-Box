import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, Button, CardActionArea, CardActions, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { utils as ethersUtils } from "ethers";
import { BuyingBox } from "../BuyingBox";
import { minWidth } from "@mui/system";
import { UpdatePriceModal } from "../UpdatePriceModal";
import { CancelSaleModal } from "../CancelSaleModel";

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
                    alt="green iguana"
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
                <Box
                    sx={{
                        display: "flex",
                        flexGrow: 1,
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        sx={{mr: 1}}
                        onClick={() => setUpdating(true)}
                        fullWidth
                    >
                        Update
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => setCanceling(true)}
                        fullWidth
                    >
                        Cancel
                    </Button>
                </Box>
                {isUpdating && (
                    <UpdatePriceModal
                        isOpen={isUpdating}
                        handleClose={() => setUpdating(false)}
                        saleId={data.id}
                        queryData={queryData}
                    />
                )}
                {isCanceling && (
                    <CancelSaleModal
                        isOpen={isCanceling}
                        handleClose={() => setCanceling(false)}
                        saleId={data.id}
                        queryData={queryData}
                    />
                )}
            </CardActions>
        </Card>
    );
};

export { OwnedSaleCard };
