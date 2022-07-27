import { NextPage } from "next";
import { useState } from "react";

import _NFTView from "./Hero/_NFTView";

const Hero: NextPage<any> = ({
  walletConnected,
  loading,
  presaleStarted,
  wlRemainCount,
  presaleEnded,
  whitelister,
  purchaseNFT,
  nftCollection,
}) => {
  const [nftAmount, setNftAmount] = useState(0); // Number of NFTs buying

  // Renders the section
  function renderSection() {
    if (!walletConnected) {
      return (
        <>
          <h1 className="text-4xl text-center">
            You&apos;ve got to connect your wallet!
          </h1>
        </>
      );
    } else if (!presaleStarted) {
      return (
        <>
          <h1 className="text-4xl text-center">Sale has not started yet!</h1>
          {whitelister ? (
            <p className="text-xl text-center">
              You are a whitelist. Please wait until whitelist starts!
            </p>
          ) : wlRemainCount > 0 ? (
            <button
              onClick={() =>
                window.open(
                  "https://whitelist-dapp-ten-ivory.vercel.app/",
                  "_blank"
                )
              }
              className="btn btn-primary"
            >
              Join Whitelist - {wlRemainCount} remaining
            </button>
          ) : (
            <button disabled className="btn btn-primary">
              Whitelist is Over
            </button>
          )}
        </>
      );
    } else if (presaleStarted && !presaleEnded) {
      return (
        <>
          <h1 className="text-4xl text-center">Presale have started!</h1>
          <p className="text-xl text-center">
            {whitelister ? "You are a whitelist" : "You are not a whitelister"}
          </p>
          {whitelister && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Enter amount to mint</span>
                </label>
                <label className="input-group">
                  <input
                    type="number"
                    placeholder="1"
                    className="input input-bordered"
                    disabled={!whitelister}
                    value={nftAmount}
                    onChange={(e) => setNftAmount(parseInt(e.target.value))}
                    min={1}
                    max={5}
                  />
                  {loading ? (
                    <button className="btn loading">Loading</button>
                  ) : (
                    <button
                      onClick={() => purchaseNFT(nftAmount)}
                      disabled={!whitelister}
                      className="btn"
                    >
                      Buy NFT
                    </button>
                  )}
                </label>
              </div>

              <div className="flex w-full justify-center items-center">
                <_NFTView nftCollection={nftCollection} />
              </div>
            </>
          )}
        </>
      );
    } else if (presaleStarted && presaleEnded) {
      return (
        <>
          <h1 className="text-4xl text-center">Public sale is live!</h1>
          <p className="text-xl text-center">
            {whitelister ? "You are a whitelist" : "You are not a whitelister"}
          </p>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Enter amount to mint</span>
            </label>
            <label className="input-group">
              <input
                type="number"
                placeholder="1"
                className="input input-bordered"
                value={nftAmount}
                onChange={(e) => setNftAmount(parseInt(e.target.value))}
                min={1}
                max={5}
              />
              {loading ? (
                <button className="btn loading">Loading</button>
              ) : (
                <button onClick={() => purchaseNFT(nftAmount)} className="btn">
                  Buy NFT
                </button>
              )}
            </label>
          </div>

          <div className="flex w-full justify-center items-center">
            <_NFTView nftCollection={nftCollection} />
          </div>
        </>
      );
    }
  }

  return (
    <>
      <div className="md:w-3/4 h-auto w-full p-5 mx-auto md:pt-20 lg:pt-24">
        <div className="flex flex-col bg-base-100/80 rounded-2xl justify-center items-center p-5 md:p-12 backdrop-blur-lg shadow-md border-2 border-primary/30 space-y-8">
          {renderSection()}
        </div>
      </div>
    </>
  );
};

export default Hero;
