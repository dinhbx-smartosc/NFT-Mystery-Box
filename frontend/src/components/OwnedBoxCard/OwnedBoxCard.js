import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const OwnedBoxCard = ({ data }) => {
    const navigate = useNavigate();
    const [metadata, setMetadata] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const res = await axios.get(data.tokenURI);
            if (res.data) {
                setMetadata(res.data);
            }
        };
        if (!metadata) {
            loadData();
        }
    }, []);

    return metadata ? (
        <Card sx={{ maxWidth: 345 }}>
            <CardActionArea
                onClick={() => {
                    navigate(`/owned_detail/${data.id}`);
                }}
            >
                <CardMedia
                    component="img"
                    height="300"
                    image={metadata.image}
                    alt="green iguana"
                    sx={{ objectFit: "cover" }}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div" noWrap>
                        {metadata.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {`Owned: ${data.balance}`}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    ) : (
        <div></div>
    );
};

export default OwnedBoxCard;
