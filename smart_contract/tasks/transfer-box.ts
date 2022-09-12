import { task } from "hardhat/config";
import "dotenv/config";

const signer = {
    owner: 0,
    user1: 1,
    user2: 2,
    user3: 3,
};

type signerKey = keyof typeof signer;

task("transfer-box", "Transfer box of Mystery Box")
    .addVariadicPositionalParam(
        "params",
        "from to amountTransfer - from, to: owner|user1|user2|user3|..."
    )
    .setAction(async (args: { params: any[] }, { ethers }) => {
        const MysteryBox = await ethers.getContractFactory("MysteryBox");
        const mysteryBox = MysteryBox.attach(
            "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
        );

        const accounts = await ethers.getSigners();
        const from = accounts[signer[args.params[0] as signerKey]];
        const to = accounts[signer[args.params[1] as signerKey]];
        const boxId = args.params[2];
        const amount = args.params[3];

        console.log("Transfering box...");
        await mysteryBox
            .connect(from)
            .safeTransferFrom(from.address, to.address, boxId, amount, "0x00");
        console.log(
            `Transfered ${amount} of ${boxId} box from ${from.address} to ${to.address}`
        );
        console.log(await mysteryBox.balanceOf(to.address, boxId));

    });
