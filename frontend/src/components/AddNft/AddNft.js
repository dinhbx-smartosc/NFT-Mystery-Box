import { Delete } from "@mui/icons-material";
import { Divider, IconButton, List, ListItem, ListItemText, ListSubheader } from "@mui/material";
import { Box } from "@mui/system";
import { AddNftButton } from "./AddNftButton";

export const AddNft = ({ listNfts, setListNfts }) => {
    return (
        <Box sx={{ minHeight: 300 }}>
            {!!listNfts.length && (
                <List
                    sx={{
                        width: "100%",
                        maxHeight: 300,
                        border: "1px solid #00000040",
                        borderRadius: 1,
                        mt: 2,
                        overflow: "auto",
                    }}
                    subheader={<ListSubheader component="div">NFT In Box</ListSubheader>}
                >
                    {listNfts.map((nft) => (
                        <Box key={nft.address + nft.tokenId}>
                            <Divider />
                            <ListItem
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        onClick={() =>
                                            setListNfts((prev) =>
                                                prev.filter(
                                                    (item) =>
                                                        item.address !== nft.address ||
                                                        item.tokenId !== nft.tokenId
                                                )
                                            )
                                        }
                                    >
                                        <Delete />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={`Address: ${nft.address}`}
                                    secondary={`TokenId: ${nft.tokenId}`}
                                />
                            </ListItem>
                        </Box>
                    ))}
                </List>
            )}
            <AddNftButton listNfts={listNfts} setListNfts={setListNfts} />
        </Box>
    );
};
