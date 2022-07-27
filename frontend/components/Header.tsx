import { NextPage } from "next";
import _ThemeSelector from "./Header/_ThemeSelector";

const Header: NextPage<any> = ({ connect, walletConnected, loading }) => {
  // Renders the button according to loading and walletConnected
  function renderButton() {
    if (loading) {
      return <button className="btn loading">Loading</button>;
    } else if (walletConnected) {
      return <button className="btn btn-disabled">Connected</button>;
    } else {
      return (
        <button className="btn btn-primary" onClick={connect}>
          Connect Wallet
        </button>
      );
    }
  }

  return (
    <>
      <div className="w-screen flex flex-col md:flex-row justify-center md:justify-around bg-base-200 items-center p-6 shadow-xl">
        <div>
          <button className="btn btn-ghost normal-case text-xl">
            Meme NFT Collection
          </button>
        </div>
        <div className="flex flex-row justify-center items-center space-x-4">
          <div>{renderButton()}</div>
          <_ThemeSelector />
        </div>
      </div>
    </>
  );
};

export default Header;
