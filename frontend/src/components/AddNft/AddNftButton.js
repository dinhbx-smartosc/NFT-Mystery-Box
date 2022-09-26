import { Box, IconButton, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useState } from "react";
import { AddNftModal } from "./AddNftModal";

export const AddNftButton = ({ listNfts, setListNfts }) => {
    const [isAdding, setAdding] = useState(false);

    return (
        <>
            <Box
                sx={{
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                }}
                onClick={() => setAdding(true)}
            >
                <IconButton sx={{ border: "1px dashed #00000040", borderRadius: 1 }}>
                    <Add />
                </IconButton>
                <Typography color="text.secondary" sx={{ ml: 1 }}>
                    Add NFT
                </Typography>
            </Box>
            {isAdding && (
                <AddNftModal
                    isOpen={isAdding}
                    handleClose={() => setAdding(false)}
                    listNfts={listNfts}
                    setListNfts={setListNfts}
                />
            )}
        </>
    );
};
