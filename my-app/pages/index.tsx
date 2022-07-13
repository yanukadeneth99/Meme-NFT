import type { NextPage } from "next";
import Head from "next/head";
import Web3Modal from "web3modal";
import { useRef, useEffect, useState } from "react";
import Core from "web3modal";
import { Contract, providers, utils } from "ethers";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants";

const Home: NextPage = () => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [numTokensMinted, setNumTokensMinted] = useState<string>("");
  const web3ModalRef = useRef<Core>();

  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const numTokenIds = await nftContract.tokenIds();
      setNumTokensMinted(numTokenIds.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const presaleMint = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully Minted!");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const publicMint = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      await tx.wait();
      setLoading(false);
      window.alert("Sucessfully Minted!");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const getOwner = async () => {
    try {
      const signer: providers.JsonRpcSigner = (await getProviderOrSigner(
        true
      )) as providers.JsonRpcSigner;
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const owner = await nftContract.owner();
      console.log(owner);
      const userAddress = await signer?.getAddress();

      if (owner.toLowerCase() === (await userAddress).toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startPresale = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const txn = await nftContract.startPresale();
      await txn.wait();
      setPresaleStarted(true);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const presaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Date.now() / 1000;

      const hasPresaleEnded: boolean = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );
      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const isPresaleStarted = await nftContract.presaleStarted();
      return isPresaleStarted;
      setPresaleStarted(isPresaleStarted);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      // Gain access to provider/signer
      const provider = await web3ModalRef.current?.connect();
      const web3Provider = new providers.Web3Provider(provider);

      // Check Network
      const { chainId } = await web3Provider.getNetwork();
      if (chainId != 4) {
        window.alert("Please switch to the Rinkeby Network");
        throw new Error("Incorrect network");
      }

      if (needSigner) {
        return web3Provider.getSigner();
      }
      return web3Provider;
    } catch (error) {
      console.error(error);
    }
  };

  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();
    if (presaleStarted) {
      await checkIfPresaleEnded();
    }
    await getNumMintedTokens();

    setInterval(async () => {
      await getNumMintedTokens();
    }, 5000);
    setInterval(async () => {
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 5000);
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      onPageLoad();
    }
  }, [walletConnected]);

  function renderBody() {
    if (!walletConnected) {
      return (
        <a onClick={connectWallet} className="btn">
          Connect Wallet
        </a>
      );
    }
    if (loading) {
      <a className="btn">Loading...</a>;
    }
    if (isOwner && !presaleStarted) {
      <a className="btn" onClick={startPresale}>
        Start Presale
      </a>;
    }
    if (!presaleStarted) {
      <a className="btn">Not Yet</a>;
    }
    if (presaleStarted && !presaleEnded) {
      <a className="btn" onClick={presaleMint}>
        Presale Mint
      </a>;
    }
    if (presaleEnded) {
      <a className="btn" onClick={publicMint}>
        Public Mint
      </a>;
    }
  }

  return (
    <>
      <Head>
        <title>Meme NFT Collection</title>
        <meta name="description" content="NFT Collection with Whitelist DApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="navbar bg-base-300 shadow-md">
        <a className="btn btn-ghost normal-case text-xl basis-2/3 justify-start">
          Meme NFT Collection
        </a>
        <div className="navbar-end basis-1/3 pr-12">{renderBody()}</div>
      </div>

      <div className="flex flex-col justify-center items-center w-screen h-screen">
        <h1 className="text-5xl font-medium text-gray-300 text-center">
          {numTokensMinted}/20 minted
        </h1>
      </div>
    </>
  );
};

export default Home;
