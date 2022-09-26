import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useDispatch } from "react-redux";
import { setAccount } from "../../redux/slices/accountSlice";
import { ethers } from "ethers";
import { mysteryBoxAddress } from "../../constant/contractAddresses";

export const Header = () => {
    const navigate = useNavigate();
    const [hasMetamask, setHasMetamask] = useState(false);
    const { enableWeb3, isWeb3Enabled, account, deactivateWeb3 } = useMoralis();
    const dispatch = useDispatch();
    const [owner, setOwner] = useState(null);

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

    useEffect(() => {
        dispatch(setAccount(account));
        const getMetadata = async () => {
            if (typeof window.ethereum !== "undefined") {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const mysteryBoxContract = new ethers.Contract(
                    mysteryBoxAddress,
                    ["function owner() view returns (address)"],
                    provider
                );
                const data = await mysteryBoxContract.owner();
                if (data) {
                    setOwner(data.toLowerCase());
                }
            }
        };
        getMetadata();
    }, [account]);

    return (
        <AppBar position="static">
            <Toolbar>
                <Box
                    sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                    onClick={() => {
                        navigate("/");
                    }}
                >
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
                            navigate("/selling");
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
                    {account && owner && account.toLowerCase() === owner.toLowerCase() && (
                        <Button
                            sx={{ my: 2, color: "white", display: "block" }}
                            onClick={() => {
                                navigate("/create_box");
                            }}
                        >
                            Create Box
                        </Button>
                    )}
                </Box>
                {hasMetamask ? (
                    isWeb3Enabled && account ? (
                        <Button
                            variant="contained"
                            color="inherit"
                            sx={{ backgroundColor: "#ffffff", color: "#1976d2" }}
                            onClick={() => {
                                deactivateWeb3();
                            }}
                        >
                            {account.substring(0, 5) +
                                "..." +
                                account.substring(account.length - 4)}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="inherit"
                            sx={{ backgroundColor: "#ffffff", color: "#1976d2" }}
                            onClick={() => {
                                enableWeb3();
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
