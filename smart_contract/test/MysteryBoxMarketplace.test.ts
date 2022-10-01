import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
    BASE_FEE,
    FIRST_BOX_ID,
    GAS_PRICE_LINK,
    KEY_HASH,
} from "../utils/constant";
import { MysteryBox, MysteryBoxMarketPlace } from "../typechain-types";

describe("MysteryBoxMarketplace", () => {
    const BOX_AMOUNT = 7;
    const FIRST_SALE_ID = 0;

    let mysteryBox: MysteryBox;
    let marketplace: MysteryBoxMarketPlace;
    let seller: SignerWithAddress;
    let buyer: SignerWithAddress;

    const deployFixture = async () => {
        const MysteryBox = await ethers.getContractFactory("MysteryBox");
        const SampleNFT = await ethers.getContractFactory("SampleNFT");
        const MysteryBoxMarketplace = await ethers.getContractFactory(
            "MysteryBoxMarketPlace"
        );
        const LinkToken = await ethers.getContractFactory("LinkToken");
        const VRFCoordinator = await ethers.getContractFactory(
            "VRFCoordinator"
        );

        const [seller, buyer] = await ethers.getSigners();

        const linkToken = await LinkToken.deploy();
        await linkToken.deployed();

        const vrfCoordinator = await VRFCoordinator.deploy(
            BASE_FEE,
            GAS_PRICE_LINK,
            linkToken.address
        );

        await vrfCoordinator.deployed();

        // Not open box here, so VRF info is not need
        const mysteryBox = await MysteryBox.deploy(
            vrfCoordinator.address,
            ethers.constants.AddressZero,
            KEY_HASH
        );

        await mysteryBox.deployed();

        const nftA = await SampleNFT.deploy("Sample NFT", "SPN", "");
        await nftA.deployed();

        // Create {BOX_AMOUNT} boxes with {FIRST_BOX_ID}.
        const nftAddresses: string[] = [];
        const tokenIds: number[] = [];
        nftA.setApprovalForAll(mysteryBox.address, true);
        for (let i = 0; i < BOX_AMOUNT; i++) {
            nftAddresses.push(nftA.address);
            tokenIds.push(i);
        }

        await mysteryBox.createBox(nftAddresses, tokenIds, "");

        const marketplace = await MysteryBoxMarketplace.deploy(
            mysteryBox.address
        );
        await marketplace.deployed();

        return {
            mysteryBox,
            marketplace,
            seller,
            buyer,
        };
    };

    beforeEach(async () => {
        ({ mysteryBox, marketplace, seller, buyer } = await loadFixture(
            deployFixture
        ));
    });

    describe("#constructor", () => {
        it("Should create new marketplace with the right mystery box contract address", async () => {
            const mysteryBoxAddress =
                await marketplace.MYSTERY_BOX_CONTRACT_ADDRESS();
            expect(mysteryBoxAddress).to.be.equal(mysteryBox.address);
        });
    });

    describe("#createSale", () => {
        const SELL_AMOUNT = BOX_AMOUNT - 3;
        const BOX_PRICE = ethers.utils.parseEther("0.5");

        beforeEach(async () => {
            await mysteryBox.setApprovalForAll(marketplace.address, true);
        });

        // Revert case
        it("Should be reverted if amount box sale is 0", async () => {
            await expect(
                marketplace.createSale(FIRST_BOX_ID, 0, BOX_PRICE)
            ).to.be.revertedWithCustomError(
                marketplace,
                "ValueNotGreaterThanZero"
            );
        });

        it("Should be reverted if box not approved", async () => {
            await mysteryBox.setApprovalForAll(marketplace.address, false);
            await expect(
                marketplace.createSale(FIRST_BOX_ID, SELL_AMOUNT, BOX_PRICE)
            ).to.be.reverted;
        });

        // Emit event
        it("Should emit SaleCreated event with the right args", async () => {
            await expect(
                marketplace.createSale(FIRST_BOX_ID, SELL_AMOUNT, BOX_PRICE)
            )
                .to.emit(marketplace, "SaleCreated")
                .withArgs(
                    seller.address,
                    FIRST_BOX_ID,
                    SELL_AMOUNT,
                    BOX_PRICE,
                    FIRST_SALE_ID
                );
        });

        // Happy case
        it("Should store the right sale info", async () => {
            await marketplace.createSale(FIRST_BOX_ID, SELL_AMOUNT, BOX_PRICE);

            const sale = await marketplace.getSale(FIRST_SALE_ID);

            expect(sale.seller).to.be.equal(seller.address);
            expect(sale.boxId).to.be.equal(FIRST_BOX_ID);
            expect(sale.quantity).to.be.equal(SELL_AMOUNT);
            expect(sale.priceEach).to.be.equal(BOX_PRICE);
        });

        it("Should transfer boxes to the contract", async () => {
            const selllerBalanceBefore = await mysteryBox.balanceOf(
                seller.address,
                FIRST_BOX_ID
            );
            const marketBalanceBefore = await mysteryBox.balanceOf(
                marketplace.address,
                FIRST_BOX_ID
            );

            await marketplace.createSale(FIRST_BOX_ID, SELL_AMOUNT, BOX_PRICE);

            const selllerBalanceAfter = await mysteryBox.balanceOf(
                seller.address,
                FIRST_BOX_ID
            );
            const marketBalanceAfter = await mysteryBox.balanceOf(
                marketplace.address,
                FIRST_BOX_ID
            );

            expect(selllerBalanceBefore.sub(selllerBalanceAfter)).to.be.equal(
                SELL_AMOUNT
            );
            expect(marketBalanceAfter.sub(marketBalanceBefore)).to.be.equal(
                SELL_AMOUNT
            );
        });
    });

    describe("#buyBox", () => {
        const SELL_AMOUNT = BOX_AMOUNT - 2;
        const BOX_PRICE = ethers.utils.parseEther("0.9");
        const BUY_AMOUNT = SELL_AMOUNT;
        const NEEDED_ETH = BOX_PRICE.mul(BUY_AMOUNT);

        beforeEach(async () => {
            await mysteryBox.setApprovalForAll(marketplace.address, true);
            await marketplace.createSale(FIRST_BOX_ID, SELL_AMOUNT, BOX_PRICE);
        });

        // Revert case
        it("Should be reverted if amount buying is 0", async () => {
            await expect(
                marketplace
                    .connect(buyer)
                    .buyBox(FIRST_SALE_ID, 0, { value: NEEDED_ETH })
            ).to.be.revertedWithCustomError(
                marketplace,
                "ValueNotGreaterThanZero"
            );
        });

        it("Should be reverted if buyer not send enough ETH", async () => {
            const SMALLER_THAN_NEEDED = NEEDED_ETH.sub(1);
            await expect(
                marketplace.connect(buyer).buyBox(FIRST_SALE_ID, BUY_AMOUNT, {
                    value: SMALLER_THAN_NEEDED,
                })
            ).to.be.revertedWithCustomError(marketplace, "PriceNotMet");
        });

        it("Should be reverted if buy more than selling box", async () => {
            const MORE_THAN_SELLING = SELL_AMOUNT + 1;
            const MORE_ETH = BOX_PRICE.mul(MORE_THAN_SELLING);
            await expect(
                marketplace
                    .connect(buyer)
                    .buyBox(FIRST_SALE_ID, MORE_THAN_SELLING, {
                        value: MORE_ETH,
                    })
            ).to.be.revertedWithCustomError(marketplace, "NotEnoughBoxForSale");
        });

        // Emit event
        it("Shoud emit BoxBought event with the right args", async () => {
            await expect(
                marketplace.connect(buyer).buyBox(FIRST_SALE_ID, BUY_AMOUNT, {
                    value: NEEDED_ETH,
                })
            )
                .to.emit(marketplace, "BoxBought")
                .withArgs(buyer.address, FIRST_SALE_ID, BUY_AMOUNT);
        });

        // Happy case
        it("Should update left boxes quantity of the sale", async () => {
            await marketplace.connect(buyer).buyBox(FIRST_SALE_ID, BUY_AMOUNT, {
                value: NEEDED_ETH,
            });

            const sale = await marketplace.getSale(FIRST_SALE_ID);

            expect(sale.quantity).to.be.equal(
                ethers.BigNumber.from(SELL_AMOUNT - BUY_AMOUNT)
            );
        });

        it("Should update balance of the box seller", async () => {
            await marketplace.connect(buyer).buyBox(FIRST_SALE_ID, BUY_AMOUNT, {
                value: NEEDED_ETH,
            });
            const balance = await marketplace.getBalance(seller.address);
            expect(balance).to.be.equal(NEEDED_ETH);
        });

        it("Should transfer bought box to the buyer", async () => {
            await marketplace.connect(buyer).buyBox(FIRST_SALE_ID, BUY_AMOUNT, {
                value: NEEDED_ETH,
            });
            const boxBalance = await mysteryBox.balanceOf(
                buyer.address,
                FIRST_BOX_ID
            );
            expect(boxBalance).to.be.equal(BUY_AMOUNT);
        });
    });

    describe("#cancelSelling", () => {
        const SELL_AMOUNT = BOX_AMOUNT;
        const BOX_PRICE = ethers.utils.parseEther("0.6");
        const CANCEL_AMOUNT = SELL_AMOUNT - 3;

        beforeEach(async () => {
            await mysteryBox.setApprovalForAll(marketplace.address, true);
            await marketplace.createSale(FIRST_BOX_ID, SELL_AMOUNT, BOX_PRICE);
        });

        // Revert case
        it("Should be reverted if caller it not the sale's owner", async () => {
            await expect(
                marketplace
                    .connect(buyer)
                    .cancelSelling(FIRST_SALE_ID, CANCEL_AMOUNT)
            ).to.be.revertedWithCustomError(marketplace, "NotSaleOwner");
        });

        it("Should be reverted if cancel amount is 0", async () => {
            await expect(
                marketplace.cancelSelling(FIRST_SALE_ID, 0)
            ).to.be.revertedWithCustomError(
                marketplace,
                "ValueNotGreaterThanZero"
            );
        });

        it("Should be reverted if cancel more than sellling", async () => {
            await expect(
                marketplace.cancelSelling(FIRST_SALE_ID, SELL_AMOUNT + 1)
            ).to.be.revertedWithCustomError(
                marketplace,
                "CancelMoreThanSelling"
            );
        });

        // Emit event
        it("Should emit SaleCanceled event with the right args", async () => {
            await expect(
                marketplace.cancelSelling(FIRST_SALE_ID, CANCEL_AMOUNT)
            )
                .to.emit(marketplace, "SaleCanceled")
                .withArgs(FIRST_SALE_ID, CANCEL_AMOUNT);
        });

        // Happy case
        it("Should update sale info", async () => {
            await marketplace.cancelSelling(FIRST_SALE_ID, CANCEL_AMOUNT);

            const sale = await marketplace.getSale(FIRST_SALE_ID);

            expect(sale.quantity).to.be.equal(SELL_AMOUNT - CANCEL_AMOUNT);
        });

        it("Should transfer boxes back to seller", async () => {
            const balanceBefore = await mysteryBox.balanceOf(
                seller.address,
                FIRST_BOX_ID
            );

            await marketplace.cancelSelling(FIRST_SALE_ID, CANCEL_AMOUNT);

            const balanceAfter = await mysteryBox.balanceOf(
                seller.address,
                FIRST_BOX_ID
            );

            expect(balanceAfter.sub(balanceBefore)).to.be.equal(CANCEL_AMOUNT);
        });
    });

    describe("#updatePrice", () => {
        const SELL_AMOUNT = BOX_AMOUNT - 2;
        const BOX_PRICE = ethers.utils.parseEther("0.9");
        const NEW_PRICE = ethers.utils.parseEther("0.3");

        beforeEach(async () => {
            await mysteryBox.setApprovalForAll(marketplace.address, true);
            await marketplace.createSale(FIRST_BOX_ID, SELL_AMOUNT, BOX_PRICE);
        });

        // Reverted case
        it("Should be reverted if not the sale owner update price", async () => {
            await expect(
                marketplace.connect(buyer).updatePrice(FIRST_SALE_ID, NEW_PRICE)
            ).to.be.revertedWithCustomError(marketplace, "NotSaleOwner");
        });

        it("Should be reverted if updae price of sold out sale", async () => {
            await marketplace
                .connect(buyer)
                .buyBox(FIRST_SALE_ID, SELL_AMOUNT, {
                    value: BOX_PRICE.mul(SELL_AMOUNT),
                });
            await expect(
                marketplace.updatePrice(FIRST_SALE_ID, NEW_PRICE)
            ).to.be.revertedWithCustomError(marketplace, "UpdateEndSale");
        });

        // Emit event
        it("Should emit PriceUpdated event with the right args", async () => {
            await expect(marketplace.updatePrice(FIRST_SALE_ID, NEW_PRICE))
                .to.emit(marketplace, "PriceUpdated")

                .withArgs(FIRST_SALE_ID, NEW_PRICE);
        });

        // Happy case
        it("Should update sale info with new price", async () => {
            await marketplace.updatePrice(FIRST_SALE_ID, NEW_PRICE);
            const sale = await marketplace.getSale(FIRST_SALE_ID);
            expect(sale.priceEach).to.be.equal(NEW_PRICE);
        });
    });

    describe("#withdraw", () => {
        const SELL_AMOUNT = BOX_AMOUNT - 4;
        const BOX_PRICE = ethers.utils.parseEther("0.66");
        const BUY_AMOUNT = SELL_AMOUNT - 1;
        const NEEDED_ETH = BOX_PRICE.mul(BUY_AMOUNT);

        beforeEach(async () => {
            await mysteryBox.setApprovalForAll(marketplace.address, true);
            await marketplace.createSale(FIRST_BOX_ID, SELL_AMOUNT, BOX_PRICE);
            await marketplace
                .connect(buyer)
                .buyBox(FIRST_SALE_ID, BUY_AMOUNT, { value: NEEDED_ETH });
        });

        it("Should transfer no ETH to withdrawer if balance is 0", async () => {
            await expect(
                marketplace.connect(buyer).withdraw()
            ).to.changeEtherBalances([marketplace, buyer], [-0, 0]);
        });

        it("Should update balance of withdrawer to 0", async () => {
            await marketplace.connect(buyer).withdraw();
            const balance = await marketplace.getBalance(buyer.address);
            expect(balance).to.be.equal(0);
        });

        it("Should change balance of the contract and withdrawer", async () => {
            await expect(marketplace.withdraw()).to.changeEtherBalances(
                [marketplace, seller],
                [NEEDED_ETH.mul(-1), NEEDED_ETH]
            );
        });
    });
});
