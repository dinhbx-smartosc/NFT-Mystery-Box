import { task, types } from "hardhat/config";
import "dotenv/config";
import {
    marketplaceAddress,
    mysteryBoxAddress,
} from "../utils/contractAddress";

const signer = {
    owner: 0,
    user1: 1,
    user2: 2,
    user3: 3,
};

type signerKey = keyof typeof signer;

task("create-sale", "Create a sale of Marketplace contract")
    .addParam(
        "seller",
        "Seller (owner) of the sold box. Values: owner|user1|user2|..."
    )
    .addParam("boxId", "ID of the box", 0, types.int)
    .addParam("amount", "Amount selling", 0, types.int)
    .addParam("price", "Price of each box. Unit: Ether", 0.0, types.float)
    .setAction(
        async (
            args: {
                seller: string;
                boxId: number;
                amount: number;
                price: number;
            },
            { ethers }
        ) => {
            const MysteryBox = await ethers.getContractFactory("MysteryBox");
            const MarketPlace = await ethers.getContractFactory(
                "MysteryBoxMarketPlace"
            );
            const mysteryBox = MysteryBox.attach(mysteryBoxAddress);
            const markeplace = MarketPlace.attach(marketplaceAddress);

            const { seller: namedSeller, boxId, amount, price } = args;

            const accounts = await ethers.getSigners();
            const seller = accounts[signer[namedSeller as signerKey]];
            const priceInEth = ethers.utils.parseEther(price.toString());

            await mysteryBox
                .connect(seller)
                .setApprovalForAll(markeplace.address, true);
            console.log("Creating sale...");
            await markeplace
                .connect(seller)
                .createSale(boxId, amount, priceInEth);
            console.log(
                `${seller.address} created sale of box ${boxId} with amount ${amount}, priceEach ${price}`
            );
        }
    );
