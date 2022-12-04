import { ContractFactory, Signer } from "ethers"
import { keccak256 } from "ethers/lib/utils"
import { ethers } from "hardhat"
import { SignerWithAddress } from "hardhat-deploy-ethers/signers"
import {
    MarketAPI,
    AddressOracle,
    StoremateBounty,
} from "../../typechain-types"

interface Users {
    deployer: SignerWithAddress
    user1: SignerWithAddress
    user2: SignerWithAddress
}

export async function deploy(contractName: string, deployer: SignerWithAddress, args: any[] = []) {
    const factory = await ethers.getContractFactory(contractName)
    const contract = await factory.connect(deployer).deploy(...args)
    return contract
}

export interface Context {
    nullAddress: string
    users: Users

    marketAPI: MarketAPI
    addressOracle: AddressOracle
    storemateBounty: StoremateBounty,

    openFactoryId: string
    dealFactoryId: string
    demeritFactoryId: string

    expiredDealDemeritId: string
}

export async function Setup(): Promise<Context> {
    const [deployer, user1, user2] = await ethers.getSigners()

    const users: Users = {
        deployer,
        user1,
        user2,
    }

    const marketAPI = (await deploy("MarketAPI", deployer)) as MarketAPI
    const addressOracle = (await deploy("AddressOracle", deployer)) as AddressOracle
    const storemateBounty = (await deploy("StoremateBounty", deployer, [
        addressOracle.address,
        marketAPI.address,
    ])) as StoremateBounty


    await addressOracle.setF0Address(user2.address, "t01109")

    return {
        nullAddress: "0x0000000000000000000000000000000000000000",
        users,

        marketAPI,
        addressOracle,

        storemateBounty

    }
}
