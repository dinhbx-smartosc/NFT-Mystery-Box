import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Box, CardActionArea } from "@mui/material";
import { useWeb3ExecuteFunction } from "react-moralis";
import { useEffect, useState } from "react";
import axios from "axios";
import { TooltipAddress } from "../TooltipAddress";
import { ethers } from "ethers";
import { Image } from "mui-image";

const nftAbi = ["function tokenURI(uint256) view returns (string)"];

const NftCard = ({ nft }) => {
    const [nftData, setNftData] = useState(null);

    useEffect(() => {
        const getMetadata = async () => {
            if (typeof window.ethereum !== "undefined") {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const nftContract = new ethers.Contract(nft.address, nftAbi, provider);
                const data = await nftContract.tokenURI(nft.tokenId);
                const res = await axios.get(data);
                if (res.data) {
                    setNftData(res.data);
                }
            }
        };
        getMetadata();
    }, []);

    return (
        <Box sx={{ minWidth: 200, maxWidth: 200, minHeight: 200, position: "relative", mb: 1 }}>
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
                    {/* <Typography
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
                    </Typography> */}
                    <Box
                        sx={{
                            maxHeight: 100,
                            position: "relative",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Image
                            src="/images/treasure.png"
                            height="100%"
                            width="60%"
                            fit="contained"
                            duration={0}
                        />
                    </Box>
                </Box>
            )}
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
                            <TooltipAddress address={nft.address} />
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Box>
    );
};

export default NftCard;
