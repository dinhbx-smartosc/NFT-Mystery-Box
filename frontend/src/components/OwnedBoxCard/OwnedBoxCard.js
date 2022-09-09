import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";

const OwnedBoxCard = () => {
    const navigate = useNavigate();

    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardActionArea
                onClick={() => {
                    navigate("/owned_detail/12");
                }}
            >
                <CardMedia
                    component="img"
                    height="300"
                    image="https://lh3.googleusercontent.com/jWiVhOj8YbjvlnRinz2wcuxTqR5rRx3QcKs6K4EmKdZHs8SqLsFjQP4kg81E-o34ibx40AJKKGsVDGH2aYPkJEK98VW01eZQyF-Lwgg=w329"
                    alt="green iguana"
                    sx={{ objectFit: "contain" }}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Lizard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Owned: 20
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default OwnedBoxCard;
