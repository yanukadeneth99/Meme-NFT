import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  //* Deployment Process
  const MemeNFT = await ethers.getContractFactory("MemeNFT");
  const memenft: any = await MemeNFT.deploy(
    20,
    "0x70d38c0a442358A9b72905B8326dBf74B0E073D6",
    "ipfs://QmYE79qUtN8wngz81Mn2XgTA2yTNUaxE4yhuuM624cCfb5/"
  );

  await memenft.deployed();

  console.log("Deployed to : ", memenft.address);

  //* Verification Process
  console.log("Sleeping...");
  await sleep(60000);

  await hre.run("verify:verify", {
    address: "0x7a49bc7356e019e57199174c28e69bbb44a96e17",
    constructorArguments: [
      20,
      "0x70d38c0a442358A9b72905B8326dBf74B0E073D6",
      "ipfs://QmYE79qUtN8wngz81Mn2XgTA2yTNUaxE4yhuuM624cCfb5/",
    ],
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
