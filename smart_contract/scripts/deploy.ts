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

    console.log("Deploying Marketplace...");
    const markeplace = await MarketPlace.deploy(mysteryBox.address);
    await markeplace.deployed();
    console.log("Marketplace deployed at:", markeplace.address);

    // Deploy Cute Cats NFT
    console.log("Deploying Cute Cats NFT...");
    const cuteCatNft = await SampleNFT.deploy(
        "Cute Cats",
        "CAT",
        "http://127.0.0.1:8080/ipfs/QmXD5xiB6XruxrDNgepwn5fw1VAWn1rWMuq6jpBnz5rcRU/"
    );
    await cuteCatNft.deployed();
    console.log("Cute Cats NFT deployed at:", cuteCatNft.address);

    // Deploy Golden Tiger NFT
    console.log("Deploying Golden Tiger NFT...");
    const goldenTigerNft = await SampleNFT.deploy(
        "Golden Tiger",
        "GTI",
        "http://127.0.0.1:8080/ipfs/QmXEvzYsAXzqnQ7gX3SP4n6zYqH59ejXP7vusG5hbzUQEX/"
    );
    await goldenTigerNft.deployed();
    console.log("Golden Tiger NFT deployed at:", goldenTigerNft.address);

    //Deploy Think Ape NFT
    console.log("Deploying Think Ape NFT...");
    const thinkingApeNft = await SampleNFT.deploy(
        "Thinking Ape",
        "APE",
        "http://127.0.0.1:8080/ipfs/QmdHSVWMnsthzWQHQ8vRs4Uu9VjyRBy74MFEyywenazwk1/"
    );
    await thinkingApeNft.deployed();
    console.log("Think Ape NFT deployed at:", thinkingApeNft.address);

    //Deploy Whale NFT
    console.log("Deploying Whale NFT...");
    const whaleNft = await SampleNFT.deploy(
        "Whale",
        "WHA",
        "http://127.0.0.1:8080/ipfs/QmcwcyfwJpzTW2DxjrhybeYEwXmV5WptPnFTHpMaT9zYEU/"
    );
    await whaleNft.deployed();
    console.log("Whale NFT deployed at:", whaleNft.address);

    //Deploy Bit Bear
    const bitBearNft = await SampleNFT.deploy(
        "Bit Bear",
        "BBE",
        "http://127.0.0.1:8080/ipfs/QmeYkm8FHezUvbwmS2sEMEMhHKSLNMdDQy4MXyXpuHWjBm/"
    );
    await bitBearNft.deployed();
    console.log("Bit Bear NFT deployed at:", bitBearNft.address);

    //Deploy Bored Cat
    const boredCatNft = await SampleNFT.deploy(
        "Bored Cat",
        "CAT",
        "http://127.0.0.1:8080/ipfs/Qmf5RGfKoMGMG2ZAyETez3mhhwpYQi2ABD8kqFd2V4AgSh/"
    );
    await boredCatNft.deployed();
    console.log("Bored Cat NFT deployed at:", boredCatNft.address);

    //Deploy Crypto Fox
    const cryptoFoxNft = await SampleNFT.deploy(
        "Crypto Fox",
        "FOX",
        "http://127.0.0.1:8080/ipfs/QmSHxWAHAKLKx8773WSk3itcgDoTayEy8TNcJe7NCeX4Vk/"
    );
    await cryptoFoxNft.deployed();
    console.log("Crypto Fox NFT deployed at:", cryptoFoxNft.address);

    //Deploy Pancake Bunnies
    const pancakeBunniesNft = await SampleNFT.deploy(
        "Pancake Bunnies",
        "BUN",
        "http://127.0.0.1:8080/ipfs/QmYD7XzdLKCPSwzKJn7R1M2UgAQJmhKNmHc72anJfgWsPw/"
    );
    await pancakeBunniesNft.deployed();
    console.log("Pancake Bunnies NFT deployed at:", pancakeBunniesNft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
