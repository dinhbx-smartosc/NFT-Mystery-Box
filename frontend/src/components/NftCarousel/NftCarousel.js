import { Card, CardMedia, Stack, Typography } from "@mui/material";
import NftCard from "../NftCard/NftCard";

const NftCarousel = ({ nfts }) => {
    return (
        <Card sx={{ p: 3, my: 1 }}>
            <Typography variant="h5" sx={{ marginBottom: 1 }}>
                NFT in Box
            </Typography>
            <Stack direction="row" spacing={2} sx={{ overflowX: "scroll" }}>
                {/* {(() => {
                    const arr = [];
                    for (let i = 0; i < 20; i++) {
                        arr.push(<NftCard />);
                    }
                    return arr;
                })()} */}
                {nfts.map((nft) => (
                    <NftCard key={`${nft.address}.${nft.tokenId}`} nft={nft} />
                ))}
            </Stack>
        </Card>
    );
};

export default NftCarousel;
