import { ethers } from "hardhat"
import { expect } from "chai"
import { arrayify } from "ethers/lib/utils"
import { Contract } from "ethers"
import { SignerWithAddress } from "hardhat-deploy-ethers/signers"
import { Context, Setup } from "./utils/Setup"

describe("StoremateBounty", () => {
    let context: Context

    beforeEach(async () => {
        context = await Setup()
    })
})
