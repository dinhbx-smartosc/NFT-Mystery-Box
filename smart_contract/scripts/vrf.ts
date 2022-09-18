import { ethers } from "hardhat";

const main = async () => {
    console.time();
    const p = () =>
        new Promise<void>((resolve, reject) => {
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
        "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    );
    const vrfCoordinator = Coordinator.attach(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    await vrfCoordinator.fulfillRandomWords(1, mysteryBox.address);
};

test2();
