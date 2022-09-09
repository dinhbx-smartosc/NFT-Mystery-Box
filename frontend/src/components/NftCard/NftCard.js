import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea } from "@mui/material";

const NftCard = () => {
    return (
        <Box sx={{ minWidth: 200, maxWidth: 200, minHeight: 200, position: "relative" }}>
            <Box
                sx={{
                    bgcolor: "#f2f2f2",
                    opacity: 0.5,
                    borderRadius: 1,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 1,
                    height: 1,
                    zIndex: "tooltip",
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: "center",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    Opened
                </Typography>
            </Box>
            <Card>
                <CardActionArea>
                    <CardMedia
                        component="img"
                        image="https://lh3.googleusercontent.com/jWiVhOj8YbjvlnRinz2wcuxTqR5rRx3QcKs6K4EmKdZHs8SqLsFjQP4kg81E-o34ibx40AJKKGsVDGH2aYPkJEK98VW01eZQyF-Lwgg=w329"
                        alt="green iguana"
                        sx={{ objectFit: "contain" }}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="div">
                            Super vip pro#123
                        </Typography>
                        <Box sx={{ display: "flex", maxWidth: 1 }}>
                            <Typography variant="subtitle2">Address:&nbsp;</Typography>
                            <Typography variant="body2" noWrap color="text.secondary">
                                0x2382488053Fa5b5559d69276822fB8767e7bD546"
                            </Typography>
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Box>
    );
};

export default NftCard;
