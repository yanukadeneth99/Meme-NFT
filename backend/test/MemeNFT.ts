import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("MemeNFT", () => {
  async function deployContract() {
    const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const WhitelistContract = await ethers.getContractFactory("Whitelist");
    const whitelistcontract: any = await WhitelistContract.deploy(5);

    await whitelistcontract.deployed();

    console.log(whitelistcontract.address);

    const MemeNFT = await ethers.getContractFactory("MemeNFT");
    const memenft: any = await MemeNFT.deploy(
      20,
      whitelistcontract.address,
      "ipfs://QmYE79qUtN8wngz81Mn2XgTA2yTNUaxE4yhuuM624cCfb5/"
    );
    await memenft.deployed();

    await whitelistcontract.connect(owner).joinWhitelist();
    await whitelistcontract.connect(addr1).joinWhitelist();

    return { memenft, whitelistcontract, owner, addr1, addr2, addr3, addr4 };
  }

  describe("Contract Basic Cases", () => {
    it("Checking Deployment", async () => {
      const { memenft, whitelistcontract, owner, addr1, addr2 } =
        await loadFixture(deployContract);
      expect(await memenft.MAX_NFT()).to.equal(20);
      expect(await memenft.isWhitelistStarted()).to.be.false;
      expect(await memenft.name()).to.equal("Meme NFT");
      expect(await memenft.symbol()).to.equal("MNFT");
      expect(await memenft.totalSupply()).to.equal(0);
      expect(await whitelistcontract.isWhitelisted(owner.address)).to.be.true;
      expect(await whitelistcontract.isWhitelisted(addr1.address)).to.be.true;
      expect(await whitelistcontract.isWhitelisted(addr2.address)).to.be.false;
      expect(await memenft.preSalePrice()).to.equal(
        ethers.utils.parseEther("0.01")
      );
      expect(await memenft.pubSalePrice()).to.equal(
        ethers.utils.parseEther("0.03")
      );
    });

    it("Full Presale check with whitelist", async () => {
      const { memenft, owner, addr1, addr2 } = await loadFixture(
        deployContract
      );
      await expect(memenft.connect(owner).presaleMint(2)).to.be.revertedWith(
        "Whitelist not started!"
      );
      await expect(memenft.connect(owner).mint(2)).to.be.revertedWith(
        "Mint is not open yet"
      );
      await memenft.connect(owner).startPresale();
      expect(await memenft.isWhitelistStarted()).to.be.true;
      await expect(memenft.mint(2)).to.be.revertedWith(
        "Whitelist is still running"
      );
      await expect(memenft.presaleMint(6)).to.be.revertedWith(
        "Maximum NFTs aquired!"
      );

      // Successful Presale mint of 5
      await expect(
        memenft.presaleMint(5, { value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("Insufficient/Overexceeded Funds");
      await expect(
        memenft.presaleMint(5, { value: ethers.utils.parseEther("0.001") })
      ).to.be.revertedWith("Insufficient/Overexceeded Funds");
      await memenft.presaleMint(5, { value: ethers.utils.parseEther("0.05") });
      await expect(memenft.presaleMint(1)).to.be.revertedWith(
        "Maximum NFTs aquired!"
      );
      expect(await memenft.totalSupply()).to.equal(5);
      expect(await memenft.balanceOf(owner.address)).to.equal(5);
      console.log(await memenft.tokenURI(1));

      // Successful Presale mint of 3
      await memenft
        .connect(addr1)
        .presaleMint(3, { value: ethers.utils.parseEther("0.03") });
      expect(await memenft.totalSupply()).to.equal(8);
      expect(await memenft.balanceOf(addr1.address)).to.equal(3);
      console.log(await memenft.tokenURI(6));

      // Testing with non whitelist address
      await expect(memenft.connect(addr2).presaleMint(4)).to.be.revertedWith(
        "You are not a whitelist"
      );
      await expect(memenft.connect(addr2).mint(4)).to.be.revertedWith(
        "Whitelist is still running"
      );
    });

    it("Full Publicsale check", async () => {
      const { memenft, owner, addr1, addr2, addr3, addr4 } = await loadFixture(
        deployContract
      );
      await memenft.connect(owner).startPresale();
      await network.provider.send("evm_increaseTime", [10800]);
      await expect(
        memenft
          .connect(owner)
          .presaleMint(4, { value: ethers.utils.parseEther("0.04") })
      ).to.be.revertedWith("Whitelist is over!");
      await memenft
        .connect(addr1)
        .mint(5, { value: ethers.utils.parseEther("0.15") });
      await expect(
        memenft
          .connect(addr1)
          .mint(1, { value: ethers.utils.parseEther("0.03") })
      ).to.be.revertedWith("Maximum NFTs aquired!");

      //Mint all tokens
      await memenft
        .connect(owner)
        .mint(5, { value: ethers.utils.parseEther("0.15") });
      await memenft
        .connect(addr2)
        .mint(5, { value: ethers.utils.parseEther("0.15") });
      await memenft
        .connect(addr3)
        .mint(5, { value: ethers.utils.parseEther("0.15") });
      await expect(
        memenft
          .connect(addr4)
          .mint(1, { value: ethers.utils.parseEther("0.03") })
      ).to.be.revertedWith("Max NFTs Reached!");
    });
  });
});
