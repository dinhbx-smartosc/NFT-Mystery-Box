import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea } from "@mui/material";
import { useWeb3ExecuteFunction } from "react-moralis";
import nftAbi from "../../constant/abi/NFT.json";
import { useEffect, useState } from "react";
import axios from "axios";

const NftCard = ({ nft }) => {
    const { fetch } = useWeb3ExecuteFunction({
        abi: nftAbi,
        contractAddress: nft.address,
        functionName: "tokenURI",
        params: {
            tokenId: nft.tokenId,
        },
    });
    const [nftData, setNftData] = useState(null);

    useEffect(() => {
        fetch({
            onSuccess: (data) => {
                const getNftData = async () => {
                    const res = await axios.get(data);
                    if (res.data) {
                        setNftData(res.data);
                    }
                };
                if (data && !nftData) {
                    getNftData();
                }
            },
        });
    });

    return (
        <Box sx={{ minWidth: 200, maxWidth: 200, minHeight: 200, position: "relative" }}>
            {nft.opened && (
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
            )}
            <Card>
                <CardActionArea>
                    <CardMedia
                        component="img"
                        image={nftData?.image}
                        alt="green iguana"
                        sx={{ objectFit: "contain" }}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="div">
                            {`${nftData?.name}#${nft.tokenId}`}
                        </Typography>
                        <Box sx={{ display: "flex", maxWidth: 1 }}>
                            <Typography variant="subtitle2">Address:&nbsp;</Typography>
                            <Typography variant="body2" noWrap color="text.secondary">
                                {nft.address}
                            </Typography>
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Box>
    );
};

export default NftCard;
