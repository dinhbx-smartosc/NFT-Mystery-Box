import { Box, Typography } from "@mui/material";
import { Image } from "mui-image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick/lib/slider";

const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    useTransform: false,
    pauseOnHover: false,
};

const imageCoverStyle = {
    borderRadius: 1,
    position: "absolute",
    top: 0,
    width: 0.2,
    height: 1,
    zIndex: "tooltip",
};

const imageTextStyle = {
    textAlign: "left",
    position: "absolute",
    zIndex: "tooltip",
    color: "#fff",
    fontSize: "6rem",
    fontWeight: "600",
    textShadow: "2px 2px 4px #000000",
};

const sliderHeight = "50vh";

export const HomeSlider = () => {
    return (
        <Box sx={{ position: "relative", width: "98%", height: sliderHeight }}>
            <Box
                sx={{
                    ...imageCoverStyle,
                    left: 0,
                    backgroundImage: "linear-gradient(to right, #fff , #ffffff00)",
                }}
            />
            <Slider {...settings} style={{ width: "100%", margin: "0 auto" }}>
                <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                    <Image src="/images/home1.jpg" height={sliderHeight} />
                    <Typography
                        variant="h2"
                        sx={{
                            ...imageTextStyle,
                            bottom: "0%",
                            right: "22%",
                        }}
                        component="pre"
                    >
                        {"Exchange\nMystery\nBox"}
                    </Typography>
                </Box>
                <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                    <Image src="/images/home2.jpg" height={sliderHeight} />
                    <Typography
                        variant="h2"
                        sx={{
                            ...imageTextStyle,
                            top: "0%",
                            left: "20%",
                        }}
                        component="pre"
                    >
                        {"Open Mystery\nBox"}
                    </Typography>
                </Box>
                <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                    <Image src="/images/home3.jpg" height={sliderHeight} />
                    <Typography
                        variant="h2"
                        sx={{
                            ...imageTextStyle,
                            bottom: "0%",
                            left: "40%",
                        }}
                        component="pre"
                    >
                        {"Get NFT"}
                    </Typography>
                </Box>
            </Slider>
            <Box
                sx={{
                    ...imageCoverStyle,
                    right: 0,
                    backgroundImage: "linear-gradient(to left, #fff , #ffffff00)",
                }}
            />
        </Box>
    );
};
