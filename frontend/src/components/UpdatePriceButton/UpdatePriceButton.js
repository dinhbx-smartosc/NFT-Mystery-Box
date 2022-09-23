import { Button } from "@mui/material";
import { useState } from "react";
import { UpdatePriceModal } from "../UpdatePriceModal";

export const UpdatePriceButton = ({ saleId, queryData }) => {
    const [isUpdating, setUpdating] = useState(false);

    return (
        <>
            <Button
                variant="contained"
                size="large"
                sx={{ mr: 1 }}
                onClick={() => setUpdating(true)}
                fullWidth
            >
                Update
            </Button>
            {isUpdating && (
                <UpdatePriceModal
                    isOpen={isUpdating}
                    handleClose={() => setUpdating(false)}
                    saleId={saleId}
                    queryData={queryData}
                />
            )}
        </>
    );
};
