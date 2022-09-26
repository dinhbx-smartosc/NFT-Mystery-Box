import { Button } from "@mui/material";
import { useState } from "react";
import { CreateBoxModal } from "./CreateBoxModal";

export const CreateBoxButton = ({ nftAddresses, tokenIds, tokenUri }) => {
    const [isCreating, setCreating] = useState(false);

    const handleCreate = () => {
        if (
            nftAddresses.length &&
            nftAddresses.length === tokenIds.length &&
            tokenUri.match(/\w+:(\/?\/?)[^\s]+/)
        ) {
            setCreating(true);
        }
    };

    return (
        <>
            <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{ mr: 2 }}
                onClick={handleCreate}
            >
                Create
            </Button>
            {isCreating && (
                <CreateBoxModal
                    isOpen={isCreating}
                    handleClose={() => setCreating(false)}
                    nftAddresses={nftAddresses}
                    tokenIds={tokenIds}
                    tokenUri={tokenUri}
                />
            )}
        </>
    );
};
