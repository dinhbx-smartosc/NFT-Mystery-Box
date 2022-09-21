import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea } from "@mui/material";
import { useWeb3ExecuteFunction } from "react-moralis";
import nftAbi from "../../constant/abi/NFT.json";
import { useEffect, useState } from "react";
import axios from "axios";

export const OpenedNftCard = ({ nft }) => {
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
    }, []);

    return (
        <Box sx={{ minWidth: 150, maxWidth: 150, mb: 1 }}>
            <Card>
                <CardActionArea>
                    <CardMedia
                        component="img"
                        image={nftData?.image}
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
