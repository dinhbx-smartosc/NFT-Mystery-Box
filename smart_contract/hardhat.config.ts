import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "./tasks/create-box"
import "./tasks/transfer-box"


const config: HardhatUserConfig = {
  solidity: "0.8.9",
};

export default config;
