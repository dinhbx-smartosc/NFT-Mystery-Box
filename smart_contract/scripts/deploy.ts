import { ethers } from "hardhat";
import {
    BASE_FEE,
    FUND_AMOUNT,
    GAS_PRICE_LINK,
    KEY_HASH,
} from "../utils/constant";

async function main() {
    const MysteryBox = await ethers.getContractFactory("MysteryBox");
    const VRFCoordinatorV2Mock = await ethers.getContractFactory(
        "VRFCoordinatorV2Mock"
    );
    const SampleNFT = await ethers.getContractFactory("SampleNFT");
    const MarketPlace = await ethers.getContractFactory(
        "MysteryBoxMarketPlace"
    );
    const [owner] = await ethers.getSigners();

    console.log("Deploying VRFCoordinatorMock...");

    const vrfCoordinator = await VRFCoordinatorV2Mock.deploy(
        BASE_FEE,
        GAS_PRICE_LINK
    );

    await vrfCoordinator.deployed();
    console.log("VRFCoordinatorMock deployed at:", vrfCoordinator.address);

    // Create subscription for VRF
    const createSubscriptionTx = await vrfCoordinator.createSubscription();
    const createSubscriptionReceipt = await createSubscriptionTx.wait();
    const subscriptionCreatedEvent = createSubscriptionReceipt.events![0];
    const subscriptionId = subscriptionCreatedEvent.args!.subId;

    // Fund subscription
    await vrfCoordinator.fundSubscription(subscriptionId, FUND_AMOUNT);

    console.log("Deploying MysteryBox...");

    const mysteryBox = await MysteryBox.deploy(
        vrfCoordinator.address,
        subscriptionId,
        KEY_HASH
    );
    await mysteryBox.deployed();
    console.log("MysteryBox deployed at:", mysteryBox.address);

    //Add mysteryBox contract to VRF subscription's consumers.
    await vrfCoordinator.addConsumer(subscriptionId, mysteryBox.address);

    console.log("Deploying NFT...");
    const sampleNft = await SampleNFT.deploy();
    await sampleNft.deployed();
    console.log("NFT deployed at:", sampleNft.address);

    console.log("Deploying Marketplace...");
    const markeplace = await MarketPlace.deploy(mysteryBox.address);
    await markeplace.deployed();
    console.log("Marketplace deployed at:", markeplace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
