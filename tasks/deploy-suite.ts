import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import { BigNumber, Contract } from "ethers"
import { task, types } from "hardhat/config"
import "hardhat-deploy"
import "hardhat-deploy-ethers"
import { DeployOptions } from "hardhat-deploy/dist/types"
import {
    MarketAPI,
    AddressOracle,
    StoremateBounty
} from "../typechain-types"

task(`deploy-suite`, `Deploy entire suite of contracts`).setAction(async (taskArgs, hre) => {
    const { ethers, run, deployments } = hre
    const { deploy: deployContract } = deployments

    console.log("Starting")
    const provider = new ethers.providers.JsonRpcProvider(
        "https://wallaby.node.glif.io/rpc/v0",
        31415
    )
    const deployer = new hre.ethers.Wallet(process.env.PRIVATE_KEY as string, provider)

    const [signer] = await ethers.getSigners()

    console.log("Awaiting provider ready")
    await provider.ready

    console.log("Awaiting fee data")

    let maxPriorityFee: BigNumber | null = null
    let attempt = 0
    while (maxPriorityFee == null) {
        try {
            maxPriorityFee = (await provider.getFeeData()).maxPriorityFeePerGas
        } catch (e) {
            attempt++
            if (attempt > 100) {
                break
            }
        }
    }

    const deploy = async (name: string, args: any[] = []) => {
        const deployResult = await deployContract(name, {
            from: deployer.address,
            args,
            // since it's difficult to estimate the gas before f4 address is launched, it's safer to manually set
            // a large gasLimit. This should be addressed in the following releases.
            gasLimit: 1000000000, // BlockGasLimit / 10
            // since Ethereum's legacy transaction format is not supported on FVM, we need to specify
            // maxPriorityFeePerGas to instruct hardhat to use EIP-1559 tx format
            maxPriorityFeePerGas: maxPriorityFee ?? undefined,
            log: true,
        })
        console.log(`${name} at address ${deployResult.address}`)

        return new hre.ethers.Contract(deployResult.address, deployResult.abi, signer)
    }

    console.log("Awaiting deploys")

    const marketAPI = (await deploy("MarketAPI")) as MarketAPI
    const addressOracle = (await deploy("AddressOracle")) as AddressOracle

    const storemateBounty = (await deploy("StoremateBounty", [
        addressOracle.address,
        marketAPI.address,
    ])) as StoremateBounty

    console.info({
        marketAPI: marketAPI.address,
        addressOracle: addressOracle.address,
        storemateBounty: storemateBounty.address,
    })
})

export default {}
