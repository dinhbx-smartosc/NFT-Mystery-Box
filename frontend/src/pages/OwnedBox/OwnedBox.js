import { Grid, Box, Container, Typography } from "@mui/material";
import OwnedBoxCard from "../../components/OwnedBoxCard/OwnedBoxCard";

const OwnedBox = () => {
    return (
        <Container>
            <Box
                sx={{
                    py: 3,
                }}
            >
                <Typography variant="h4" sx={{ py: 3 }}>
                    Selling Boxes
                </Typography>
                <Grid container spacing={2}>
                    {(() => {
                        const arr = [];
                        for (let i = 0; i < 10; i++) {
                            arr.push(
                                <Grid item xs={3}>
                                    <OwnedBoxCard />
                                </Grid>
                            );
                        }
                        return arr;
                    })()}
                </Grid>
            </Box>
        </Container>
    );
};

export default OwnedBox;
