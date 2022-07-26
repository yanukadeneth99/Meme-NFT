import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  //* Deployment Process
  const MemeNFT = await ethers.getContractFactory("MemeNFT");
  const memenft: any = await MemeNFT.deploy(
    20,
    "0xb1E540a22F341c6Aba9Dc4e060Aa86A56bBABd19",
    "ipfs://QmYE79qUtN8wngz81Mn2XgTA2yTNUaxE4yhuuM624cCfb5/"
  );

  await memenft.deployed();

  console.log("Deployed to : ", memenft.address);

  //* Verfication Process
  console.log("Sleeping...");
  await sleep(50000);

  await hre.run("verify:verify", {
    address: memenft.address,
    constructorArguments: [
      20,
      "0xb1E540a22F341c6Aba9Dc4e060Aa86A56bBABd19",
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
