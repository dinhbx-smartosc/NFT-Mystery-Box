import { task, types } from "hardhat/config";
import "dotenv/config";

const signer = {
    owner: 0,
    user1: 1,
    user2: 2,
    user3: 3,
};

type signerKey = keyof typeof signer;

task("transfer-box", "Transfer box of Mystery Box")
    .addParam("from", "from account owner|user1|user2...")
    .addParam("to", "to account owner|user1|user2...")
    .addParam("boxid", "Box ID", 0, types.int)
    .addParam("amount", "amount transfer", 0, types.int)
    .setAction(
        async (
            args: { from: string; to: string; boxid: number; amount: number },
            { ethers }
        ) => {
            const MysteryBox = await ethers.getContractFactory("MysteryBox");
            const mysteryBox = MysteryBox.attach(
                "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
            );

            const accounts = await ethers.getSigners();
            const from = accounts[signer[args.from as signerKey]];
            const to = accounts[signer[args.to as signerKey]];
            const boxId = args.boxid;
            const amount = args.amount;

            console.log("Transfering box...");
            await mysteryBox
                .connect(from)
                .safeTransferFrom(
                    from.address,
                    to.address,
                    boxId,
                    amount,
                    "0x00"
                );
            console.log(
                `Transfered ${amount} of ${boxId} box from ${from.address} to ${to.address}`
            );
            console.log(await mysteryBox.balanceOf(to.address, boxId));
        }
    );
