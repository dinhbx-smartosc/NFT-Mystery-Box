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
    const Coordinator = await ethers.getContractFactory("VRFCoordinatorV2Mock");

    const mysteryBox = MysteryBox.attach(
        "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    );
    const vrfCoordinator = Coordinator.attach(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    console.log("Openning box...");
    const openTx = await mysteryBox.openBox(FIRST_BOX_ID, 1);
    const txReceipt = await openTx.wait();
    const requestId = txReceipt.events![2].args!.requestId;
    await vrfCoordinator.fulfillRandomWords(requestId, mysteryBox.address);
    console.log("Box opened...");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
