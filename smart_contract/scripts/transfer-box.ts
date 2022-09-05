import { ethers } from "hardhat";
import {
    BASE_FEE,
    FIRST_BOX_ID,
    FUND_AMOUNT,
    GAS_PRICE_LINK,
    KEY_HASH,
} from "../utils/constant";
import { BytesLike } from "@ethersproject/bytes";

async function main() {
    const MysteryBox = await ethers.getContractFactory("MysteryBox");
    const mysteryBox = MysteryBox.attach(
        "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    );
    const [owner, user] = await ethers.getSigners();
    console.log("Transfering box...");

    await mysteryBox.connect(user).safeTransferFrom(
        user.address,
        owner.address,
        FIRST_BOX_ID,
        2,
        "0x00"
    );
    console.log("Box transfered!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
