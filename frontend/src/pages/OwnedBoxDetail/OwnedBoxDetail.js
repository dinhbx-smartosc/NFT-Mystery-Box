import {
    Box,
    Container,
    Typography,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
} from "@mui/material";
import Counter from "../../components/Counter";
import NftCarousel from "../../components/NftCarousel/NftCarousel";
import { useNavigate } from "react-router-dom";

const OwnedBoxDetail = () => {
    return (
        <Container>
            <Box
                sx={{
                    py: 3,
                }}
            >
                <Card sx={{ display: "flex", p: 5 }}>
                    <CardMedia
                        sx={{ flex: 5, maxWidth: "50%" }}
                        component="img"
                        image="https://public.nftstatic.com/static/nft/res/nft-cex/S3/1655089248414_m9y6y7lrogtfc20xpeq60sn4rrgkjf7y.png"
                        alt="green iguana"
                    />
                    <Box
                        sx={{
                            flex: 5,
                            px: 5,
                        }}
                    >
                        <CardContent>
                            <Typography gutterBottom variant="h4" component="div">
                                Lizard
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Owned: 20
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ marginTop: 5 }}
                            >
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio
                                inventore culpa libero a quod. Similique omnis, quos cum, cumque
                                incidunt eum sit iure consectetur sed beatae reiciendis, at itaque
                                magnam.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ my: 5 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "end",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Counter />
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{ flex: 2, marginLeft: 1 }}
                                >
                                    Open
                                </Button>
                            </Box>
                        </CardActions>
                    </Box>
                </Card>
            </Box>
            <NftCarousel></NftCarousel>
        </Container>
    );
};

export default OwnedBoxDetail;
