import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-waffle";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  defaultNetwork: "rinkeby",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_KEY_URL,
      accounts: [process.env.RINKEBY_PRIVATE_KEY || ""],
    },
  },
};

export default config;
