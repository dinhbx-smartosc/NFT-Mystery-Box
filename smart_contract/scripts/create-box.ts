import hre from "hardhat";

async function main() {

    await hre.run("create-box", {
        contract: "cuteCat",
        ids: [0, 1, 2, 3]
    })

    await hre.run("create-box", {
        contract: "goldenTiger",
        ids: [9, 8, 7, 6]
    })

    await hre.run("create-box", {
        contract: "thinkingApe",
        ids: [2, 4, 6, 8]
    })

    await hre.run("create-box", {
        contract: "whale",
        ids: [1, 5, 7, 9]
    })

    await hre.run("create-box", {
        contract: "cuteCat",
        ids: [7, 8, 9]
    })

    await hre.run("create-box", {
        contract: "goldenTiger",
        ids: [1, 2, 3, 4]
    })

    await hre.run("create-box", {
        contract: "thinkingApe",
        ids: [1, 3, 5, 7]
    })

    await hre.run("create-box", {
        contract: "whale",
        ids: [0, 2, 3, 4, 6, 8]
    })

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
