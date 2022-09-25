import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { HomeSlider } from "../../components/HomeSlider/HomeSlider";
import { BoxCarousel } from "../../components/BoxCarousel/BoxCarousel";
import { Box, Container } from "@mui/material";

export const Home = () => {
    return (
        <>
            <HomeSlider />
            <Container>
                <Box
                    sx={{
                        mt: 5,
                        py: 3,
                        minHeight: "50vh",
                    }}
                >
                    <BoxCarousel />
                </Box>
            </Container>
        </>
    );
};
