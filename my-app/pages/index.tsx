import type { NextPage } from "next";
import Head from "next/head";
import Web3Modal from "web3modal";
import { useRef, useEffect, useState } from "react";
import Core from "web3modal";
import { Contract, providers, utils } from "ethers";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants";
import { useSnackbar } from "notistack";
import BGImage from "../public/wallpaper.jpg";

const Home: NextPage = () => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [numTokensMinted, setNumTokensMinted] = useState<string>("");
  const web3ModalRef = useRef<Core>();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

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
      const key = enqueueSnackbar("Minting...", {
        variant: "info",
        persist: true,
      });
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
      closeSnackbar(key);
      enqueueSnackbar("Sucessfully minted!", { variant: "success" });
    } catch (error) {
      console.error(error);
      closeSnackbar();
      enqueueSnackbar("Error minting!", { variant: "error" });
    }
    setLoading(false);
  };

  const publicMint = async () => {
    try {
      setLoading(true);
      const key = enqueueSnackbar("Minting...", {
        variant: "info",
        persist: true,
      });
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
      closeSnackbar(key);
      enqueueSnackbar("Sucessfully minted!", { variant: "success" });
    } catch (error) {
      console.error(error);
      closeSnackbar();
      enqueueSnackbar("Error minting!", { variant: "error" });
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
      const userAddress = await signer?.getAddress();

      if (owner.toLowerCase() === (await userAddress).toLowerCase()) {
        setIsOwner(true);
        enqueueSnackbar("You are the owner", { variant: "info" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const startPresale = async () => {
    try {
      setLoading(true);
      const key = enqueueSnackbar("Starting Presale...", {
        variant: "info",
        persist: true,
      });
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const txn = await nftContract.startPresale();
      await txn.wait();
      setPresaleStarted(true);
      closeSnackbar(key);
      enqueueSnackbar("Sucessfully minted!", { variant: "success" });
    } catch (error) {
      console.error(error);
      closeSnackbar();
      enqueueSnackbar("Error starting Presale", { variant: "error" });
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
      setPresaleStarted(isPresaleStarted);
      return isPresaleStarted;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      enqueueSnackbar("Wallet Connected Successfully", { variant: "success" });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error with wallet connection", { variant: "error" });
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
      return <a className="btn">Loading...</a>;
    }
    if (isOwner && !presaleStarted) {
      return (
        <a className="btn" onClick={startPresale}>
          Start Presale
        </a>
      );
    }
    if (!presaleStarted) {
      return <a className="btn">Not Yet</a>;
    }
    if (presaleStarted && !presaleEnded) {
      return (
        <a className="btn" onClick={presaleMint}>
          Presale Mint
        </a>
      );
    }
    if (presaleEnded) {
      return (
        <a className="btn" onClick={publicMint}>
          Public Mint
        </a>
      );
    }
  }

  const withdrawCash = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const NftContract = await new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );
      const tx = await NftContract.withdraw();
      tx.wait();
      window.alert("Withdrew all");
      enqueueSnackbar("Sucessfully withdrew", { variant: "success" });
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      enqueueSnackbar(`Error withdrawing : ${error}`, { variant: "error" });
    }
  };

  return (
    <>
      <Head>
        <title>Meme NFT Collection</title>
        <meta name="description" content="NFT Collection with Whitelist DApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="fixed navbar bg-base-300 shadow-md">
        <a className="btn btn-ghost normal-case text-xl basis-2/3 justify-start">
          Meme NFT Collection
        </a>
        <div className="navbar-end basis-1/3 pr-12">{renderBody()}</div>
      </div>

      <div
        className="flex flex-col justify-center items-center w-screen h-screen"
        style={{ background: `url(${BGImage.src})`, backgroundSize: "cover" }}
      >
        <div className="backdrop-blur-xl border-2 border-gray-200/10 shadow-xl p-20 space-y-5">
          <h1 className="text-5xl font-medium text-gray-800 text-center">
            {numTokensMinted}/20 minted
          </h1>
          {isOwner && (
            <div className="flex flex-row space-x-3 justify-center items-center pt-6">
              <a className="btn" onClick={startPresale}>
                Restart Presale
              </a>
              <a className="btn" onClick={withdrawCash}>
                Withdraw Cash
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
