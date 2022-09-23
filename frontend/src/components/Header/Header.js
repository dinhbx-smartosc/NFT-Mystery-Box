import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

const Header = () => {
    const navigate = useNavigate();
    const [hasMetamask, setHasMetamask] = useState(false);
    const { enableWeb3, isWeb3Enabled, account } = useMoralis();
    useEffect(() => {
        if (typeof window.ethereum !== "undefined") {
            setHasMetamask(true);
            window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
                if (accounts.length) {
                    enableWeb3();
                }
            });
        }
    }, []);

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
                    <Button
                        sx={{ my: 2, color: "white", display: "block" }}
                        onClick={() => {
                            navigate("/history");
                        }}
                    >
                        History
                    </Button>
                </Box>
                {hasMetamask ? (
                    isWeb3Enabled ? (
                        <Button
                            variant="contained"
                            color="inherit"
                            sx={{ backgroundColor: "#ffffff", color: "#1976d2" }}
                        >
                            {account.substring(0, 5) + "..." + account.substring(account.length - 4)}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="inherit"
                            sx={{ backgroundColor: "#ffffff", color: "#1976d2" }}
                            onClick={() => {
                                enableWeb3();
                                // window.localStorage.setItem("enabled", "true");
                            }}
                        >
                            Connect
                        </Button>
                    )
                ) : (
                    <Typography variant="button">Please install Metamask!</Typography>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
