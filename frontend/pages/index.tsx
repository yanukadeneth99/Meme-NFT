import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { useSnackbar } from "notistack";
import { BigNumber, Contract, ethers, providers } from "ethers";
import Core from "web3modal";
import {
  MEMENFT_ABI,
  MEMENFT_ADDRESS,
  WHITELIST_ABI,
  WHITELIST_ADDRESS,
} from "../constants";

import Header from "../components/Header";
import Hero from "../components/Hero";

const Home: NextPage = () => {
  const [walletConnected, setWalletConnected] = useState(false); // Is wallet connected?
  const [loading, setLoading] = useState(false); // Is Application loading?
  const [presaleStarted, setPresaleStarted] = useState(false); // Is Presale started?
  const [wlRemainCount, setWlRemainCount] = useState(0); // How many whitelists are remaning
  const [presaleEnded, setPresaleEnded] = useState(false); // Did presale end?
  const [whitelister, setWhitelister] = useState(false); // Are you a whitelister?
  const [nftCollection, setNftCollection] = useState<any>([]); // Bought Collection of NFTs

  const web3ModalRef = useRef<Core>();
  const { enqueueSnackbar } = useSnackbar();

  // Gets a Provider or Signer
  const getProviderOrSigner = async (needSigner = false) => {
    const instance = await web3ModalRef?.current?.connect();
    const provider = new ethers.providers.Web3Provider(instance);

    const { chainId, name } = await provider.getNetwork();
    if (chainId != 4) {
      enqueueSnackbar(
        `You are in the ${name} network. Please switch to Rinkeby Network`,
        {
          variant: "error",
          preventDuplicate: true,
        }
      );
      return;
    }

    if (needSigner) {
      return provider.getSigner();
    }
    return provider;
  };

  // Connect the wallet
  const connect = async () => {
    try {
      if (!window.ethereum) {
        enqueueSnackbar("You need to install a wallet like Metamask", {
          variant: "error",
          preventDuplicate: true,
        });
        return;
      }
      if (!walletConnected) {
        setLoading(true);
        web3ModalRef.current = new Web3Modal({
          network: "mumbai",
          cacheProvider: true,
          providerOptions: {},
          disableInjectedProvider: false,
        });

        const provider = await getProviderOrSigner();
        if (provider) {
          await getPresaleStatus();
          await getWhitelistRemainingCount();
          await getPresaleEndtime();
          await getWhitelister();
          await getURIforTokens();
          setWalletConnected(true);
          enqueueSnackbar("Successfully connected your wallet!", {
            variant: "success",
            preventDuplicate: true,
          });
        }
        setLoading(false);
      }
    } catch (error: any) {
      enqueueSnackbar(`Error Connecting Wallet : ${error.message}`, {
        variant: "error",
      });
      setLoading(false);
    }
  };

  // Get whether Presale has started
  const getPresaleStatus = async () => {
    try {
      const provider = await getProviderOrSigner();
      const memeContract = new Contract(MEMENFT_ADDRESS, MEMENFT_ABI, provider);
      setPresaleStarted(await memeContract.isWhitelistStarted());
    } catch (error: any) {
      enqueueSnackbar(`Error Getting Presale Status : ${error.message}`, {
        variant: "error",
      });
    }
  };

  // Get the presale time and return true if current time is greater than endTimeStamp
  const getPresaleEndtime = async () => {
    try {
      const provider = await getProviderOrSigner();
      const memeContract = new Contract(MEMENFT_ADDRESS, MEMENFT_ABI, provider);
      const _endtime: BigNumber = await memeContract.endTimestamp();
      const _timenow = Math.floor(Date.now() / 1000);

      const _bool = _endtime.lt(_timenow);
      setPresaleEnded(_bool);
    } catch (error: any) {
      enqueueSnackbar(`Error Getting Presale Status : ${error.message}`, {
        variant: "error",
      });
    }
  };

  // Get the remaning whitelist count
  const getWhitelistRemainingCount = async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        WHITELIST_ADDRESS,
        WHITELIST_ABI,
        provider
      );
      const _maxWL: number = await whitelistContract.maxWhitelistedAddresses();
      const _curWL: BigNumber = await whitelistContract.getNumberOfWhitelist();
      const result = _maxWL - _curWL.toNumber();
      setWlRemainCount(result);
    } catch (error: any) {
      enqueueSnackbar(`Error Getting Whitelist Count : ${error.message}`, {
        variant: "error",
      });
    }
  };

  // Get whether you are a whitelist
  const getWhitelister = async () => {
    try {
      const signer = (await getProviderOrSigner(
        true
      )) as providers.JsonRpcSigner;
      const whitelistContract = new Contract(
        WHITELIST_ADDRESS,
        WHITELIST_ABI,
        signer
      );
      const _wl: boolean = await whitelistContract.isWhitelisted(
        await signer.getAddress()
      );
      setWhitelister(_wl);
    } catch (error: any) {
      enqueueSnackbar(
        `Error Checking whether you are a whitelist : ${error.message}`,
        {
          variant: "error",
        }
      );
    }
  };

  // Purchase NFTs
  const purchaseNFT = async (quant: number) => {
    try {
      if (quant > 5 || quant < 1) {
        throw new Error("Please set a value between 1 and 5");
      }
      setLoading(true);
      const signer = (await getProviderOrSigner(
        true
      )) as providers.JsonRpcSigner;
      const memeContract = new Contract(MEMENFT_ADDRESS, MEMENFT_ABI, signer);
      let tx: any;
      if (presaleStarted && !presaleEnded) {
        tx = await memeContract.presaleMint(BigNumber.from(quant.toString()), {
          value: ethers.utils.parseEther((0.01 * quant).toString()),
        });
      } else {
        tx = await memeContract.mint(BigNumber.from(quant.toString()), {
          value: ethers.utils.parseEther((0.03 * quant).toString()),
        });
      }
      await tx.wait();
      enqueueSnackbar(`Successfully bought ${quant} NFTs`, {
        variant: "success",
      });
      await getURIforTokens();
      setLoading(false);
    } catch (error: any) {
      enqueueSnackbar(`Error Buying a NFT : ${error.message}`, {
        variant: "error",
      });
      setLoading(false);
    }
  };

  // Get the URI for all the tokens the owner has
  const getURIforTokens = async () => {
    try {
      const signer = (await getProviderOrSigner(
        true
      )) as providers.JsonRpcSigner;
      const _ad = await signer.getAddress();

      const options = { method: "GET" };

      fetch(
        `https://testnets-api.opensea.io/api/v1/assets?owner=${_ad}&asset_contract_address=${MEMENFT_ADDRESS}&order_direction=desc&offset=0&limit=20&include_orders=false`,
        options
      )
        .then((response) => response.json())
        .then((response) => setNftCollection(response.assets))
        .catch((err) => console.error(err));
    } catch (error: any) {
      enqueueSnackbar(`Error when getting tokens of Owner : ${error.message}`, {
        variant: "error",
      });
    }
  };

  // Runs connect wallet when page loads
  useEffect(() => {
    connect();
  }, [walletConnected]);

  return (
    <>
      <NextSeo
        title="Meme NFT Collection"
        description="A Meme NFT Collection created by Yanuka Deneth"
      />
      <div className="bg-transparent w-screen h-screen">
        <Header
          loading={loading}
          walletConnected={walletConnected}
          connect={connect}
        />
        <Hero
          walletConnected={walletConnected}
          loading={loading}
          presaleStarted={presaleStarted}
          wlRemainCount={wlRemainCount}
          presaleEnded={presaleEnded}
          whitelister={whitelister}
          purchaseNFT={purchaseNFT}
          nftCollection={nftCollection}
        />
      </div>
    </>
  );
};

export default Home;
