import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, Button, CardActionArea, CardActions } from "@mui/material";
import Counter from "../Counter";
import { useNavigate } from "react-router-dom";

const SellingBoxCard = () => {
    const navigate = useNavigate();

    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardActionArea
                onClick={() => {
                    navigate("/selling_detail/12");
                }}
            >
                <CardMedia
                    component="img"
                    height="300"
                    image="https://public.nftstatic.com/static/nft/zipped/8061c9dbe0d74430b53d904468d946d9_zipped.png"
                    alt="green iguana"
                    sx={{ objectFit: "contain" }}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Lizard
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography gutterBottom variant="subtitle1" component="div">
                            0.5ETH
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Amount: 20
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>
            <CardActions sx={{ m: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexGrow: 1,
                        alignItems: "end",
                        justifyContent: "space-between",
                    }}
                >
                    <Counter />
                    <Button variant="contained" size="large" sx={{ flex: 2, marginLeft: 1 }}>
                        Buy
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
};

export default SellingBoxCard;
