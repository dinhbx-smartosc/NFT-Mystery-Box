import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { mysteryBoxAddress } from "../utils/contractAddress";

const main = async () => {
    console.time();
    const p = () =>
        new Promise<void>((resolve, _reject) => {
            setTimeout(() => {
                console.log("wait 2s");
                resolve();
            }, 10000);
        });
    await p();
    console.timeEnd();
    console.log("haha");
};

const test2 = async () => {
    const MysteryBox = await ethers.getContractFactory("MysteryBox");
    const Coordinator = await ethers.getContractFactory("VRFCoordinatorV2Mock");

    const mysteryBox = MysteryBox.attach(
        mysteryBoxAddress
    );
    const vrfCoordinator = Coordinator.attach(
        "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    );

    //await vrfCoordinator.fulfillRandomWords(1, mysteryBox.address);

    vrfCoordinator.on(
        "RandomWordsRequested",
        async (
            _keyHash,
            requestId: BigNumber,
            _preSeed,
            _subId,
            _minimumRequestConfirmations,
            _callbackGasLimit,
            _numWords,
            sender: string
        ) => {
            try {
                await vrfCoordinator.fulfillRandomWords(requestId, sender);
                console.log(
                    "Returned random words to requestId:",
                    requestId.toString()
                );
            } catch {
                console.log("Return faild to requestId:", requestId.toString());
            }
        }
    );
};

test2();
