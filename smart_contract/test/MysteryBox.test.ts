import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
    BASE_FEE,
    FUND_AMOUNT,
    GAS_PRICE_LINK,
    KEY_HASH,
    NftType,
} from "../utils/constant";
import {
    MysteryBox,
    SampleNFT,
    VRFCoordinatorV2Mock,
} from "../typechain-types";
import {
    SubscriptionCreatedEvent,
    SubscriptionCreatedEventObject,
} from "../typechain-types/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock";

describe("MysteryBox", () => {
    let mysteryBox: MysteryBox;
    let owner: SignerWithAddress;
    let user: SignerWithAddress;
    let nftA: SampleNFT;
    let nftB: SampleNFT;

    const deployFixture = async () => {
        const MysteryBox = await ethers.getContractFactory("MysteryBox");
        const SampleNFT = await ethers.getContractFactory("SampleNFT");
        const VRFCoordinatorV2Mock = await ethers.getContractFactory(
            "VRFCoordinatorV2Mock"
        );
        const [owner, user] = await ethers.getSigners();

        const vrfCoordinator = await VRFCoordinatorV2Mock.deploy(
            BASE_FEE,
            GAS_PRICE_LINK
        );

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

        const nftA = await SampleNFT.deploy();
        await nftA.deployed();

        const nftB = await SampleNFT.deploy();
        await nftB.deployed();

        return {
            owner,
            user,
            mysteryBox,
            nftA,
            nftB,
        };
    };

    beforeEach(async () => {
        ({ owner, user, mysteryBox, nftA, nftB } = await loadFixture(
            deployFixture
        ));
    });

    describe("#addNftToPool", () => {
        const commonNftId = 3;
        const rareNftId = 8;
        const veryRareNftId = 4;

        beforeEach(async () => {
            nftA.setApprovalForAll(mysteryBox.address, true);
        });

        // Happy case
        it("Should add NFT to the right pool", async () => {
            
            await mysteryBox.addNftToPool(nftA.address, commonNftId, NftType.COMMON);
            await mysteryBox.addNftToPool(nftA.address, rareNftId, NftType.RARE);
            await mysteryBox.addNftToPool(nftA.address, veryRareNftId, NftType.VERY_RARE);
            
            const nftInCommonPool = await mysteryBox.getNftInPool(NftType.COMMON)
            const nftInRarePool = await mysteryBox.getNftInPool(NftType.RARE)
            const nftInVeryRarePool = await mysteryBox.getNftInPool(NftType.VERY_RARE)

            expect(nftInCommonPool[0].tokenId).to.be.equal(commonNftId)
            expect(nftInRarePool[0].tokenId).to.be.equal(rareNftId)
            expect(nftInVeryRarePool[0].tokenId).to.be.equal(veryRareNftId)
            
        });
    });
});
