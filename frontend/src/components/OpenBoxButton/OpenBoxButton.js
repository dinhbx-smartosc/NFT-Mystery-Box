import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { emitInfo } from "../../redux/slices/alertSlice";
import { Counter } from "../Counter";
import { OpenBoxModal } from "./OpenBoxModal";

export const OpenBoxButton = ({ boxId, queryData, maxOpen }) => {
    const [openAmount, setOpenAmount] = useState("");
    const [isOpening, setOpening] = useState(false);
    const dispatch = useDispatch();

    const handleOpen = () => {
        if (openAmount < 1) {
            dispatch(emitInfo({ content: "Open amount should be greater than 0" }));
            return;
        }
        setOpening(true);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexGrow: 1,
                maxWidth: 250,
                alignItems: "end",
                justifyContent: "space-between",
            }}
        >
            <Counter number={openAmount} setNumber={setOpenAmount} maxNumber={maxOpen} />
            <Button
                variant="contained"
                size="large"
                sx={{ flex: 1, marginLeft: 1 }}
                onClick={handleOpen}
            >
                Open
            </Button>
            {isOpening && (
                <OpenBoxModal
                    isOpen={isOpening}
                    handleClose={() => setOpening(false)}
                    queryData={queryData}
                    openInfo={{ openAmount, boxId }}
                    maxOpen={maxOpen}
                    setCounter={setOpenAmount}
                />
            )}
        </Box>
    );
};
