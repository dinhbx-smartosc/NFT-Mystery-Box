import { describe, it, beforeEach } from "mocha"
import { expect } from "chai"
import { ethers } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"   
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("MysteryBox", () => {

    async function deployFixture() {
        const MysteryBox = await ethers.getContractFactory("MysteryBox")
        const mysteryBox = await MysteryBox.deploy(
            
        )
    }

})