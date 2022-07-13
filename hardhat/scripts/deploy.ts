import { ethers } from "hardhat";
import { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } from "../constants/index";

async function main() {
  const MemeNFT = await ethers.getContractFactory("MemeNFT");
  const memenft = await MemeNFT.deploy(
    METADATA_URL,
    WHITELIST_CONTRACT_ADDRESS
  );

  await memenft.deployed();
  console.log("NFT Contract deployed", memenft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
