import hre from "hardhat";
import { ethers } from "hardhat";
import {
    BASE_FEE,
    FUND_AMOUNT,
    GAS_PRICE_LINK,
    INIT_BALANCE,
    KEY_HASH,
} from "../utils/constant";

const deploy = async () => {
    const MysteryBox = await ethers.getContractFactory("MysteryBox");
    const LinkToken = await ethers.getContractFactory("LinkToken");
    const VRFCoordinator = await ethers.getContractFactory("VRFCoordinator");
    const SampleNFT = await ethers.getContractFactory("SampleNFT");
    const MarketPlace = await ethers.getContractFactory(
        "MysteryBoxMarketPlace"
    );

    console.log("Deploying LinkToken...");
    const linkToken = await LinkToken.deploy();
    await linkToken.deployed();
    console.log("LinkToken deployed at:", linkToken.address);

    console.log("Deploying VRFCoordinatorMock...");
    const vrfCoordinator = await VRFCoordinator.deploy(
        BASE_FEE,
        GAS_PRICE_LINK,
        linkToken.address
    );
    await vrfCoordinator.deployed();
    console.log("VRFCoordinatorMock deployed at:", vrfCoordinator.address);

    console.log("Deploying MysteryBox...");
    const mysteryBox = await MysteryBox.deploy(
        vrfCoordinator.address,
        linkToken.address,
        KEY_HASH
    );

    await mysteryBox.deployed();
    console.log("MysteryBox deployed at:", mysteryBox.address);

    await linkToken.transfer(
        mysteryBox.address,
        ethers.utils.parseEther("100.0")
    );
    await mysteryBox.fundSubscription(INIT_BALANCE);

    console.log("Deploying Marketplace...");
    const markeplace = await MarketPlace.deploy(mysteryBox.address);
    await markeplace.deployed();
    console.log("Marketplace deployed at:", markeplace.address);

    // Deploy Cute Cats NFT
    console.log("Deploying Cute Cats NFT...");
    const cuteCatNft = await SampleNFT.deploy(
        "Cute Cats",
        "CAT",
        "http://127.0.0.1:8080/ipfs/QmXD5xiB6XruxrDNgepwn5fw1VAWn1rWMuq6jpBnz5rcRU/"
    );
    await cuteCatNft.deployed();
    console.log("Cute Cats NFT deployed at:", cuteCatNft.address);

    // Deploy Golden Tiger NFT
    console.log("Deploying Golden Tiger NFT...");
    const goldenTigerNft = await SampleNFT.deploy(
        "Golden Tiger",
        "GTI",
        "http://127.0.0.1:8080/ipfs/QmXEvzYsAXzqnQ7gX3SP4n6zYqH59ejXP7vusG5hbzUQEX/"
    );
    await goldenTigerNft.deployed();
    console.log("Golden Tiger NFT deployed at:", goldenTigerNft.address);

    //Deploy Think Ape NFT
    console.log("Deploying Think Ape NFT...");
    const thinkingApeNft = await SampleNFT.deploy(
        "Thinking Ape",
        "APE",
        "http://127.0.0.1:8080/ipfs/QmdHSVWMnsthzWQHQ8vRs4Uu9VjyRBy74MFEyywenazwk1/"
    );
    await thinkingApeNft.deployed();
    console.log("Think Ape NFT deployed at:", thinkingApeNft.address);

    //Deploy Whale NFT
    console.log("Deploying Whale NFT...");
    const whaleNft = await SampleNFT.deploy(
        "Whale",
        "WHA",
        "http://127.0.0.1:8080/ipfs/QmcwcyfwJpzTW2DxjrhybeYEwXmV5WptPnFTHpMaT9zYEU/"
    );
    await whaleNft.deployed();
    console.log("Whale NFT deployed at:", whaleNft.address);

    //Deploy Bit Bear
    const bitBearNft = await SampleNFT.deploy(
        "Bit Bear",
        "BBE",
        "http://127.0.0.1:8080/ipfs/QmeYkm8FHezUvbwmS2sEMEMhHKSLNMdDQy4MXyXpuHWjBm/"
    );
    await bitBearNft.deployed();
    console.log("Bit Bear NFT deployed at:", bitBearNft.address);

    //Deploy Bored Cat
    const boredCatNft = await SampleNFT.deploy(
        "Bored Cat",
        "CAT",
        "http://127.0.0.1:8080/ipfs/Qmf5RGfKoMGMG2ZAyETez3mhhwpYQi2ABD8kqFd2V4AgSh/"
    );
    await boredCatNft.deployed();
    console.log("Bored Cat NFT deployed at:", boredCatNft.address);

    //Deploy Crypto Fox
    const cryptoFoxNft = await SampleNFT.deploy(
        "Crypto Fox",
        "FOX",
        "http://127.0.0.1:8080/ipfs/QmSHxWAHAKLKx8773WSk3itcgDoTayEy8TNcJe7NCeX4Vk/"
    );
    await cryptoFoxNft.deployed();
    console.log("Crypto Fox NFT deployed at:", cryptoFoxNft.address);

    //Deploy Pancake Bunnies
    const pancakeBunniesNft = await SampleNFT.deploy(
        "Pancake Bunnies",
        "BUN",
        "http://127.0.0.1:8080/ipfs/QmYD7XzdLKCPSwzKJn7R1M2UgAQJmhKNmHc72anJfgWsPw/"
    );
    await pancakeBunniesNft.deployed();
    console.log("Pancake Bunnies NFT deployed at:", pancakeBunniesNft.address);

    //Deploy Business Whale
    const businessWhale = await SampleNFT.deploy(
        "Business Whale",
        "BWE",
        "http://127.0.0.1:8080/ipfs/Qmefx7RDQJnf4ryP8dRGPUvybbms9gtfRz9B6sc3U67igF/"
    );
    await businessWhale.deployed();
    console.log("Business Whale NFT deployed at:", businessWhale.address);

    //Deploy Holy Bear
    const holyBearNft = await SampleNFT.deploy(
        "Holy Bear",
        "BUN",
        "http://127.0.0.1:8080/ipfs/QmT2vBxWhjbYLJKUfHXqf7CXaS3Abcy1FKRFgcuLfk7MbP/"
    );
    await holyBearNft.deployed();
    console.log("Holy Bear NFT deployed at:", holyBearNft.address);

    //Deploy Meta Frog
    const metaFrogNft = await SampleNFT.deploy(
        "Meta Frog",
        "BUN",
        "http://127.0.0.1:8080/ipfs/QmaKLHVSe16ctZnwVjrd2Jv6AtS4W7R94mQzKTo6B65cvo/"
    );
    await metaFrogNft.deployed();
    console.log("Meta Frog NFT deployed at:", metaFrogNft.address);

    //Deploy Moose Typcoons
    const mooseTypcoons = await SampleNFT.deploy(
        "Moose Typcoons",
        "BUN",
        "http://127.0.0.1:8080/ipfs/QmV31wrVPnhYB7PKvS5xRvfte7Zoeau4i6VB42bYzJkPFe/"
    );
    await mooseTypcoons.deployed();
    console.log("Moose Typcoons NFT deployed at:", mooseTypcoons.address);

    //Deploy tonSummerNft
    const tonSummerNft = await SampleNFT.deploy(
        "Ton Summer",
        "BUN",
        "http://127.0.0.1:8080/ipfs/QmSq995HrEojjXho2aesUbi6JaPVTG7esqeUgVKabCevbD/"
    );
    await tonSummerNft.deployed();
    console.log("Ton Summer NFT deployed at:", tonSummerNft.address);
};

const createBox = async () => {
    await hre.run("create-box", {
        contract: "cuteCat",
        ids: [0, 1, 2, 3, 4, 5],
    });

    await hre.run("create-box", {
        contract: "goldenTiger",
        ids: [9, 8, 7, 6],
    });

    await hre.run("create-box", {
        contract: "thinkingApe",
        ids: [2, 4, 6, 8],
    });

    await hre.run("create-box", {
        contract: "whale",
        ids: [1, 5, 7, 9],
    });

    await hre.run("create-box", {
        contract: "cuteCat",
        ids: [6, 7, 8, 9],
    });

    await hre.run("create-box", {
        contract: "goldenTiger",
        ids: [1, 2, 3, 4],
    });

    await hre.run("create-box", {
        contract: "thinkingApe",
        ids: [1, 3, 5, 7],
    });

    await hre.run("create-box", {
        contract: "whale",
        ids: [0, 2, 3, 4, 6, 8],
    });
};

const transferBox = async () => {
    for (let i = 0; i < 8; i++) {
        await hre.run("transfer-box", {
            from: "owner",
            to: "user1",
            boxid: i,
            amount: 2,
        });
    }
};

const createSale = async () => {
    await hre.run("create-sale", {
        seller: "owner",
        boxId: 0,
        amount: 3,
        price: 1.2,
    });
    await hre.run("create-sale", {
        seller: "owner",
        boxId: 1,
        amount: 2,
        price: 145,
    });
    await hre.run("create-sale", {
        seller: "owner",
        boxId: 5,
        amount: 2,
        price: 11,
    });
    await hre.run("create-sale", {
        seller: "owner",
        boxId: 0,
        amount: 1,
        price: 99,
    });
    await hre.run("create-sale", {
        seller: "owner",
        boxId: 4,
        amount: 2,
        price: 1.88,
    });
    await hre.run("create-sale", {
        seller: "user1",
        boxId: 7,
        amount: 2,
        price: 278,
    });
    await hre.run("create-sale", {
        seller: "user1",
        boxId: 1,
        amount: 1,
        price: 101,
    });
    await hre.run("create-sale", {
        seller: "user1",
        boxId: 6,
        amount: 1,
        price: 1.9,
    });
    await hre.run("create-sale", {
        seller: "user1",
        boxId: 2,
        amount: 2,
        price: 0.1,
    });
    await hre.run("create-sale", {
        seller: "user1",
        boxId: 3,
        amount: 2,
        price: 0.11,
    });
    await hre.run("create-sale", {
        seller: "user1",
        boxId: 4,
        amount: 2,
        price: 55,
    });
};

const main = async () => {
    await deploy();
    await createBox();
    await transferBox();
    await createSale();
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
