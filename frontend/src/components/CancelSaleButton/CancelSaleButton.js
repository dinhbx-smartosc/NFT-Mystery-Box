import { Button } from "@mui/material";
import { useState } from "react";
import { CancelSaleModal } from "./CancelSaleModal";

export const CancelSaleButton = ({ queryData, saleInfo }) => {
    const [isCanceling, setCanceling] = useState(false);

    return (
        <>
            <Button variant="outlined" size="large" onClick={() => setCanceling(true)} fullWidth>
                Cancel
            </Button>
            {isCanceling && (
                <CancelSaleModal
                    isOpen={isCanceling}
                    handleClose={() => setCanceling(false)}
                    saleInfo={saleInfo}
                    queryData={queryData}
                />
            )}
        </>
    );
};
