import { Box, Link, Typography } from "@mui/material";

const FooterTitle = ({ children }) => {
    return (
        <Typography variant="h5" sx={{ color: "#fff", fontSize: "2rem", fontWeight: 700 }}>
            {children}
        </Typography>
    );
};

const FooterLink = ({ children, sx }) => {
    return (
        <Link
            underline="none"
            color="text.secondary"
            sx={{ display: "block", color: "#fff", mt: 2, ...sx }}
        >
            {children}
        </Link>
    );
};

export const Footer = () => {
    return (
        <Box
            sx={{
                height: "30vh",
                backgroundColor: "#1976d2",
                mt: 10,
                py: 5,
                px: 10,
            }}
        >
            <Typography
                variant="h4"
                sx={{ color: "#fff", textAlign: "center", fontWeight: "700", fontSize: "3rem" }}
            >
                Mystery Box: Open Box, Get NFT
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexGrow: 1,
                    maxWidth: "66%",
                    mx: "auto",
                    mt: 5,
                    justifyContent: "space-between",
                }}
            >
                <Box sx={{ maxWidth: 250, ml: 10 }}>
                    <FooterTitle>About Us</FooterTitle>
                    <FooterLink sx={{ mt: 3 }}>Developer</FooterLink>
                    <FooterLink>Blockchain Division</FooterLink>
                    <FooterLink>SmartOSC</FooterLink>
                </Box>
                <Box sx={{ maxWidth: 250, ml: 10 }}>
                    <FooterTitle>Features</FooterTitle>
                    <FooterLink sx={{ mt: 3 }}>Exchange Box</FooterLink>
                    <FooterLink>Open Box</FooterLink>
                    <FooterLink>Create Box</FooterLink>
                </Box>
                <Box sx={{ maxWidth: 250, ml: 10 }}>
                    <FooterTitle>Contact Us</FooterTitle>
                    <FooterLink sx={{ mt: 3 }}>Phone: +84 971 443 356</FooterLink>
                    <FooterLink>Email: dinhbx@smartosc.com</FooterLink>
                    <FooterLink></FooterLink>
                </Box>
                <Box sx={{ maxWidth: 250, ml: 10 }}>
                    <FooterTitle>Social Media</FooterTitle>
                    <FooterLink sx={{ mt: 3 }}>Facebook</FooterLink>
                    <FooterLink>Twitter</FooterLink>
                    <FooterLink>Discord</FooterLink>
                </Box>
            </Box>
        </Box>
    );
};
