import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
    MysteryBox,
    MysteryBoxMarketPlace,
    SampleNFT,
    VRFCoordinatorV2Mock,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
    BASE_FEE,
    FIRST_BOX_ID,
    FUND_AMOUNT,
    GAS_PRICE_LINK,
    KEY_HASH,
} from "../utils/constant";

describe("Integration", () => {
    const CREATED_BOX = 10;
    const SOLD_BOX = 8;
    const BOUGHT_BOX = 5;

    let mysteryBox: MysteryBox;
    let vrfCoordinator: VRFCoordinatorV2Mock;
    let marketplace: MysteryBoxMarketPlace;
    let sampleNft: SampleNFT;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;

    const deployFixture = async () => {
        const MysteryBox = await ethers.getContractFactory("MysteryBox");
        const SampleNFT = await ethers.getContractFactory("SampleNFT");
        const MysteryBoxMarketplace = await ethers.getContractFactory(
            "MysteryBoxMarketPlace"
        );
        const VRFCoordinatorV2Mock = await ethers.getContractFactory(
            "VRFCoordinatorV2Mock"
        );
        const [owner, user] = await ethers.getSigners();

        const vrfCoordinator = await VRFCoordinatorV2Mock.deploy(
            BASE_FEE,
            GAS_PRICE_LINK
        );

        await vrfCoordinator.deployed();

        // Create subscription for VRF
        const createSubscriptionTx = await vrfCoordinator.createSubscription();
        const createSubscriptionReceipt = await createSubscriptionTx.wait();
        const subscriptionCreatedEvent = createSubscriptionReceipt.events![0];
        const subscriptionId = subscriptionCreatedEvent.args!.subId;

        // Fund subscription
        await vrfCoordinator.fundSubscription(subscriptionId, FUND_AMOUNT);

        const mysteryBox = await MysteryBox.deploy(
            vrfCoordinator.address,
            subscriptionId,
            KEY_HASH
        );
        await mysteryBox.deployed();

        //Add mysteryBox contract to VRF subscription's consumers.
        await vrfCoordinator.addConsumer(subscriptionId, mysteryBox.address);

        const sampleNft = await SampleNFT.deploy();
        await sampleNft.deployed();

        const marketplace = await MysteryBoxMarketplace.deploy(
            mysteryBox.address
        );
        await marketplace.deployed();

        return {
            mysteryBox,
            vrfCoordinator,
            marketplace,
            sampleNft,
            owner,
            user,
        };
    };

    before(async () => {
        ({ mysteryBox, vrfCoordinator, marketplace, sampleNft, owner, user } =
            await loadFixture(deployFixture));
    });

    

});
