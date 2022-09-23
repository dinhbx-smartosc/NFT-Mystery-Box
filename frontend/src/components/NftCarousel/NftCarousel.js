import { Card, CardMedia, Stack, Typography } from "@mui/material";
import NftCard from "../NftCard/NftCard";

export const NftCarousel = ({ nfts }) => {
    return (
        <Card sx={{ p: 3, my: 1 }} variant="outlined">
            <Typography variant="h5" sx={{ marginBottom: 1 }}>
                NFT in Box
            </Typography>
            <Stack className="nftStack" direction="row" spacing={2} sx={{ overflowX: "auto" }}>
                {nfts.map((nft) => (
                    <NftCard key={`${nft.address}.${nft.tokenId}`} nft={nft} />
                ))}
            </Stack>
        </Card>
    );
};
