import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
    BASE_FEE,
    CREATE_BOX_LINK,
    FIRST_BOX_ID,
    FUND_AMOUNT,
    GAS_PRICE_LINK,
    INIT_BALANCE,
    KEY_HASH,
} from "../utils/constant";
import {
    MysteryBox,
    SampleNFT,
    SampleNFT__factory,
    VRFCoordinatorV2Mock,
} from "../typechain-types";
import { BigNumber } from "@ethersproject/bignumber";

describe("MysteryBox", () => {
    let mysteryBox: MysteryBox;
    let owner: SignerWithAddress;
    let vrfCoordinator: VRFCoordinatorV2Mock;
    let SampleNFT: SampleNFT__factory;
    let nftA: SampleNFT;

    const deployFixture = async () => {
        const MysteryBox = await ethers.getContractFactory("MysteryBox");
        const SampleNFT = await ethers.getContractFactory("SampleNFT");
        const LinkToken = await ethers.getContractFactory("LinkToken");
        const VRFCoordinator = await ethers.getContractFactory(
            "VRFCoordinator"
        );
        const [owner] = await ethers.getSigners();

        const linkToken = await LinkToken.deploy();
        await linkToken.deployed();

        const vrfCoordinator = await VRFCoordinator.deploy(
            BASE_FEE,
            GAS_PRICE_LINK,
            linkToken.address
        );

        await vrfCoordinator.deployed();

        const mysteryBox = await MysteryBox.deploy(
            vrfCoordinator.address,
            linkToken.address,
            KEY_HASH
        );

        await mysteryBox.deployed();

        await linkToken.transfer(
            mysteryBox.address,
            ethers.utils.parseEther("100.0")
        );
        await mysteryBox.fundSubscription(INIT_BALANCE);

        const nftA = await SampleNFT.deploy("Sample NFT", "SPN", "");
        await nftA.deployed();

        return {
            owner,
            vrfCoordinator,
            mysteryBox,
            SampleNFT,
            nftA,
        };
    };

    beforeEach(async () => {
        ({ owner, vrfCoordinator, mysteryBox, SampleNFT, nftA } =
            await loadFixture(deployFixture));
        nftA.setApprovalForAll(mysteryBox.address, true);
    });

    describe("#createBox", () => {
        let nftAddresses: string[] = [];
        let tokenIds: number[] = [];
        const ADDED_NFTS = 5;

        beforeEach(async () => {
            nftAddresses = [];
            tokenIds = [];
            for (let i = 0; i < ADDED_NFTS; i++) {
                nftAddresses.push(nftA.address);
                tokenIds.push(i);
            }
        });

        // Revert case
        it("Should revert if nftAddresses mismatch tokenIds", async () => {
            nftAddresses.push(nftA.address);

            await expect(
                mysteryBox.createBox(nftAddresses, tokenIds, "")
            ).to.be.revertedWithCustomError(
                mysteryBox,
                "AddressesAndTokenIdsMismatch"
            );
        });

        it("Should be reverted if amount create is 0", async () => {
            await expect(
                mysteryBox.createBox([], [], "")
            ).to.be.revertedWithCustomError(
                mysteryBox,
                "ValueNotGreaterThanZero"
            );
        });

        // Emit event
        it("Should emit BoxCreated event with the right args", async () => {
            await expect(mysteryBox.createBox(nftAddresses, tokenIds, ""))
                .to.emit(mysteryBox, "BoxCreated")
                .withArgs(FIRST_BOX_ID, nftAddresses, tokenIds, "");
        });

        // Happy case
        it("Should create new box with passed NFTs", async () => {
            await mysteryBox.createBox(nftAddresses, tokenIds, "");

            const boxInfo = await mysteryBox.getBoxInfo(FIRST_BOX_ID);

            for (let i = 0; i < boxInfo.length; i++) {
                const boxedNft = boxInfo[i];
                expect(boxedNft.contractAddress).to.be.equal(nftAddresses[i]);
                expect(boxedNft.tokenId).to.be.equal(tokenIds[i]);
            }
        });

        it("Should transfer NFT from the owner to the contract", async () => {
            await mysteryBox.createBox(nftAddresses, tokenIds, "");

            const ownerPromise: Promise<string>[] = [];
            for (let i = 0; i < nftAddresses.length; i++) {
                const ownerRequest = SampleNFT.attach(nftAddresses[i]).ownerOf(
                    tokenIds[i]
                );
                ownerPromise.push(ownerRequest);
            }

            const owners = await Promise.all(ownerPromise);
            owners.forEach((i) => {
                expect(i).to.be.equal(mysteryBox.address);
            });
        });

        it("Should mint right amount of box for the owner", async () => {
            await mysteryBox.createBox(nftAddresses, tokenIds, "");

            const balance = await mysteryBox.balanceOf(
                owner.address,
                FIRST_BOX_ID
            );

            expect(balance).to.be.equal(ADDED_NFTS);
        });
    });

    describe("#openBox", () => {
        const BOX_AMOUNT = 5;
        const OPEN_AMOUNT = 3;

        beforeEach(async () => {
            const nftAddresses: string[] = [];
            const tokenIds: number[] = [];
            for (let i = 0; i < BOX_AMOUNT; i++) {
                nftAddresses.push(nftA.address);
                tokenIds.push(i);
            }
            await mysteryBox.createBox(nftAddresses, tokenIds, "");
        });

        // Reverted case
        it("Should be reverted if pass wrong box id", async () => {
            const WRONG_BOX_ID = 99;
            await expect(
                mysteryBox.openBox(WRONG_BOX_ID, OPEN_AMOUNT)
            ).to.be.revertedWithCustomError(mysteryBox, "InvalidBoxId");
        });

        it("Should be reverted if open amount is less than 1", async () => {
            await expect(
                mysteryBox.openBox(FIRST_BOX_ID, 0)
            ).to.be.revertedWithCustomError(
                mysteryBox,
                "ValueNotGreaterThanZero"
            );
        });

        it("Should be reverted if open more than owned boxes", async () => {
            await expect(
                mysteryBox.openBox(FIRST_BOX_ID, BOX_AMOUNT + 1)
            ).to.be.revertedWithCustomError(
                mysteryBox,
                "InsufficientBoxForOpen"
            );
        });

        // Emit event
        it("Should emit OpenBoxRequested event with the right args", async () => {
            const openTx = await mysteryBox.openBox(FIRST_BOX_ID, OPEN_AMOUNT);
            const txReceipt = await openTx.wait();

            // First event is of burn function, second is of requestRandomWords, so OpenBoxRequested is 3th event.
            const event = txReceipt.events![2];
            const { opener, boxId, amount } = event.args!;
            expect(opener).to.be.equal(owner.address);
            expect(boxId).to.be.equal(FIRST_BOX_ID);
            expect(amount).to.be.equal(OPEN_AMOUNT);
        });

        // Happy case
        it("Should burn the opened boxes", async () => {
            await mysteryBox.openBox(FIRST_BOX_ID, OPEN_AMOUNT);

            const balance = await mysteryBox.balanceOf(
                owner.address,
                FIRST_BOX_ID
            );
            expect(balance).to.be.equal(BOX_AMOUNT - OPEN_AMOUNT);
        });

        it("Should store the right open info", async () => {
            const openTx = await mysteryBox.openBox(FIRST_BOX_ID, OPEN_AMOUNT);
            const txReceipt = await openTx.wait();

            const requestId = txReceipt.events![2].args!.requestId;
            const openInfo = await mysteryBox.getOpenInfo(requestId);

            expect(openInfo.opener).to.be.equal(owner.address);
            expect(openInfo.boxId).to.be.equal(FIRST_BOX_ID);
        });

        it("Should pick random NFTs and return them to opener", async () => {
            const t = () =>
                new Promise<void>((resolve, reject) => {
                    mysteryBox.once(
                        "NFTReceived",
                        async (
                            _,
                            nftAddresses: string[],
                            tokenIds: BigNumber[]
                        ) => {
                            try {
                                expect(nftAddresses.length).to.be.equal(
                                    OPEN_AMOUNT
                                );

                                // Received NFT address is valid
                                nftAddresses.forEach((addr) => {
                                    expect(addr).to.be.equal(nftA.address);
                                });

                                // NFT is transfer to opener
                                tokenIds.forEach(async (id) => {
                                    const nftOwner = await nftA.ownerOf(id);
                                    expect(nftOwner).to.be.equal(owner.address);
                                });

                                const leftNft = await mysteryBox.getBoxInfo(
                                    FIRST_BOX_ID
                                );

                                const leftTokenIds = leftNft.map((nft) =>
                                    nft.tokenId.toString()
                                );

                                const receivedTokenIds = tokenIds.map((id) =>
                                    id.toString()
                                );

                                // Left NFT is amount box - amount opened
                                expect(leftNft.length).to.be.equal(
                                    BOX_AMOUNT - OPEN_AMOUNT
                                );

                                // Opened NFT not in left NFT
                                receivedTokenIds.forEach((id) => {
                                    expect(leftTokenIds).not.to.contain(id);
                                });

                                resolve();
                            } catch (err) {
                                console.log((err as Error).message);
                                reject();
                            }
                        }
                    );
                });

            const t1 = async () => {
                const openTx = await mysteryBox.openBox(
                    FIRST_BOX_ID,
                    OPEN_AMOUNT
                );
                const txReceipt = await openTx.wait();
                const requestId = txReceipt.events![2].args!.requestId;
                await vrfCoordinator.fulfillRandomWords(
                    requestId,
                    mysteryBox.address
                );
            };
            await Promise.all([t(), t1()]);
        });
    });
});
