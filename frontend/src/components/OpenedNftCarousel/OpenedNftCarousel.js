import { Card, CardMedia, Stack, Typography } from "@mui/material";
import NftCard from "../NftCard/NftCard";
import { OpenedNftCard } from "../OpenedNftCard/OpenedNftCard";

export const OpenedNftCarousel = ({ nfts }) => {
    return (
        <Card sx={{ px: 1, pt: 1, my: 1 }} variant="outlined">
            <Stack className="nftStack" direction="row" spacing={2} sx={{ overflowX: "scroll" }}>
                {nfts.map((nft) => (
                    <OpenedNftCard key={`${nft.address}.${nft.tokenId}`} nft={nft} />
                ))}
            </Stack>
        </Card>
    );
};
