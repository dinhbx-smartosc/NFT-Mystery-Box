import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    return (
        <AppBar position="static">
            <Toolbar>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img src="/sumup_logo_v3.png" style={{ height: "50px" }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        sx={{
                            mr: 2,
                            display: { xs: "none", md: "flex" },
                            fontFamily: "monospace",
                            fontWeight: 700,
                            letterSpacing: ".1rem",
                            color: "inherit",
                            textDecoration: "none",
                            fontSize: "1.5rem",
                        }}
                    >
                        MysteryBox
                    </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                    <Button
                        sx={{ my: 2, color: "white", display: "block" }}
                        onClick={() => {
                            navigate("/");
                        }}
                    >
                        Selling
                    </Button>
                    <Button
                        sx={{ my: 2, color: "white", display: "block" }}
                        onClick={() => {
                            navigate("/owned");
                        }}
                    >
                        Owned
                    </Button>
                    <Button sx={{ my: 2, color: "white", display: "block" }}>History</Button>
                </Box>
                <Button variant="contained" color="inherit" sx={{ backgroundColor: "#ffffff", color: "#1976d2" }}>
                    Connect
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
