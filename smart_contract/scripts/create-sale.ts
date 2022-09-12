import { ethers } from "hardhat";
import {
    FIRST_BOX_ID,
} from "../utils/constant";

async function main() {

    const MysteryBox = await ethers.getContractFactory("MysteryBox");
    const MarketPlace = await ethers.getContractFactory(
        "MysteryBoxMarketPlace"
    );
    const markeplace = MarketPlace.attach(
        "0x0165878A594ca255338adfa4d48449f69242Eb8F"
    );
    const mysteryBox = MysteryBox.attach(
        "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    );

    await mysteryBox.setApprovalForAll(markeplace.address, true)

    console.log("Creating sale...");
    await markeplace.createSale(FIRST_BOX_ID, 2, ethers.utils.parseEther("1.0"))
    console.log("Sale created!");
    
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
