import { task, types } from "hardhat/config";
import "dotenv/config";

const nftContracts = {
    cuteCat: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    goldenTiger: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
    thinkingApe: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
    whale: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
};

type nftKeys = keyof typeof nftContracts;

task("create-box", "Create new box of Mystery Box contract")
    .addParam("contract", "NFT contract used for creating box")
    .addVariadicPositionalParam("ids", "Token IDs will be boxed", [], types.int)
    .setAction(
        async (args: { contract: string; ids: number[] }, { ethers }) => {
            const MysteryBox = await ethers.getContractFactory("MysteryBox");
            const SampleNFT = await ethers.getContractFactory("SampleNFT");
            const mysteryBox = MysteryBox.attach(
                "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
            );

            const nft = SampleNFT.attach(
                nftContracts[args.contract as nftKeys]
            );

            const nftAddresses: string[] = Array(args.ids.length).fill(
                nft.address
            );
            await nft.setApprovalForAll(mysteryBox.address, true);

            const boxCounter = await mysteryBox.boxTypeCounter();
            const uri = `${process.env.IPFS_GATEWAY}/${process.env.BOX_CID}/${boxCounter}`;

            console.log("Creating box...");
            await mysteryBox.createBox(nftAddresses, args.ids, uri);
            console.log("Box created id:", boxCounter);
        }
    );
