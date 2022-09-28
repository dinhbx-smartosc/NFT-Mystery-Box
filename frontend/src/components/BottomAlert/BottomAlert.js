import { Alert, Snackbar } from "@mui/material";

export const BottomAlert = ({ isOpen, handleClose, children, severity }) => {
    return (
        <Snackbar
            open={isOpen}
            autoHideDuration={3000}
            onClose={handleClose}
            sx={{
                zIndex: 9999,
            }}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                variant="filled"
                sx={{ width: "100%" }}
            >
                {children}
            </Alert>
        </Snackbar>
    );
};
