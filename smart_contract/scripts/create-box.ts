import { ethers } from "hardhat";
import {
    BASE_FEE,
    FIRST_BOX_ID,
    FUND_AMOUNT,
    GAS_PRICE_LINK,
    KEY_HASH,
} from "../utils/constant";

async function main() {
    const MysteryBox = await ethers.getContractFactory("MysteryBox");
    const SampleNFT = await ethers.getContractFactory("SampleNFT");

    const mysteryBox = MysteryBox.attach(
        "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    );
    const sampleNft = SampleNFT.attach(
        "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
    );

    await sampleNft.setApprovalForAll(mysteryBox.address, true);
    const tokenIds = [0, 2, 4, 6];
    const addresses = [
        sampleNft.address,
        sampleNft.address,
        sampleNft.address,
        sampleNft.address,
    ];

    console.log("Creating box...");
    await mysteryBox.createBox(addresses, tokenIds);
    console.log("Box created");

    const box = await mysteryBox.getBoxInfo(FIRST_BOX_ID);
    console.log(
        box
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
