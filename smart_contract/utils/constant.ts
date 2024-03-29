import { ethers } from "hardhat";

const BASE_FEE = ethers.BigNumber.from("250000000000000000"); // 0.25 LINK
const GAS_PRICE_LINK = ethers.BigNumber.from("1000000000"); //0.000000001 LINK per gas
const KEY_HASH =
    "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"; //Chainlink VRF gasLane, any value
const FUND_AMOUNT = ethers.BigNumber.from("100000000000000000000"); // 100 LINK

const FIRST_BOX_ID = 0;

const INIT_BALANCE = ethers.utils.parseEther("10.0");
const CREATE_BOX_LINK = ethers.utils.parseEther("0.5");

export {
    BASE_FEE,
    GAS_PRICE_LINK,
    KEY_HASH,
    FUND_AMOUNT,
    FIRST_BOX_ID,
    INIT_BALANCE,
    CREATE_BOX_LINK
};
