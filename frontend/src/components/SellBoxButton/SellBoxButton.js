import { useState } from "react";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import { Button } from "@mui/material";
import { SellBoxModal } from "./SellBoxModal";

export const SellBoxButton = ({ saleData, queryData }) => {
    const [isSelling, setSelling] = useState(false);

    return (
        <>
            <Button
                variant="outlined"
                size="large"
                onClick={() => setSelling(true)}
                sx={{ mt: 5 }}
                endIcon={<ShoppingCartCheckoutIcon />}
            >
                Send to marketplace
            </Button>
            {isSelling && (
                <SellBoxModal
                    // owner={id.split(".")[0]}
                    // boxId={data?.boxBalance.box.boxId}
                    owner={saleData.owner}
                    boxId={saleData.boxId}
                    isSelling={isSelling}
                    handleClose={() => setSelling(false)}
                    queryData={queryData}
                />
            )}
        </>
    );
};
