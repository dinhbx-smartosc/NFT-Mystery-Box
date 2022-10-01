import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "./tasks/create-box";
import "./tasks/transfer-box";
import "./tasks/create-sale";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.4.11",
            },
            {
                version: "0.4.24",
            },
            {
                version: "0.4.8",
            },
            {
                version: "0.8.9",
            },
        ],
    },
    defaultNetwork: "localhost",
};

export default config;
