import hre from "hardhat";

async function main() {

    await hre.run("create-sale", {
        seller: "owner",
        boxId: 2,
        amount: 2,
        price: 1.2,
    });

    await hre.run("create-sale", {
        seller: "owner",
        boxId: 3,
        amount: 2,
        price: 15,
    });

    await hre.run("create-sale", {
        seller: "owner",
        boxId: 4,
        amount: 2,
        price: 7.8,
    });

    await hre.run("create-sale", {
        seller: "owner",
        boxId: 5,
        amount: 3,
        price: 90,
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
