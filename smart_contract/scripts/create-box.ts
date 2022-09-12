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
    const cuteCatNft = SampleNFT.attach(
        "0x0165878A594ca255338adfa4d48449f69242Eb8F"
    );

    await cuteCatNft.setApprovalForAll(mysteryBox.address, true);
    const tokenIds = [0, 1, 5, 7];
    const addresses = [
        cuteCatNft.address,
        cuteCatNft.address,
        cuteCatNft.address,
        cuteCatNft.address,
    ];

    console.log("Creating box...");
    await mysteryBox.createBox(
        addresses,
        tokenIds,
        "http://127.0.0.1:8080/ipfs/QmXicvbZ3Si5XQdtSS985PmH8ZSsEV98Z1KJPc9x15RJWc/0"
    );
    console.log(await mysteryBox.uri(0))
    console.log("Box created");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
