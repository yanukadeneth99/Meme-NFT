//SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

/** 
@title NFT Collection Contract
@author Yanuka Deneth
@notice NFT Collection contract for minting, transfering and general actions.
@dev Contract inherits from ERC721, ERC721Enumerable, Ownable
*/
contract MemeNFT is ERC721Enumerable, Ownable {
    /// @dev This string holds the URI for the tokens, and is private.
    string private _baseTokenURI;

    /// @dev This holds the whitelist addresses function interface `whitelistedAddresses`
    IWhitelist whitelist;

    /// @dev If true, the presale is started. Used in `startPresale()`, `presaleMint()` and `mint()`
    bool public presaleStarted;

    /// @dev Variable to hold Timestamp for when the presale should end.
    uint256 public presaleEnded;

    /// @dev Max Tokens
    uint8 public maxTokenIds = 20;

    /// @dev Current Tokens that are minted
    uint8 public tokenIds;

    /// @dev Price of one NFT
    uint public _price = 0.01 ether;

    /// @dev Whether the contract is paused. Effects `mint()` and `presaleMint()`
    bool public _paused;

    /// @notice Used in `presaleMint()` and `mint()` to only run if contract is not paused
    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract currently paused");
        _;
    }

    /// @notice Initialises the contract
    /// @param baseURI enter the link for the metadata
    /// @param whitelistContract enter the deployed contract address of the Whitelist Contract
    constructor(string memory baseURI, address whitelistContract)
        ERC721("NFTCol", "NFTC")
    {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    /// @notice Start Presale
    /// @dev Time will be 5 minutes of presale from the time the function triggers.
    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }

    /// @notice Minting During presale
    /// @dev Presale must start, During the 5 minutes time span, caller must be a whitelist and should not exceed the token count. Also contract must be unpaused.
    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted, "Presale haven't started yet");
        require(block.timestamp < presaleEnded, "Presale ended");
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "You are not a whitelist"
        );
        require(tokenIds < maxTokenIds, "Mint Limit Exceeded");
        require(msg.value >= _price, "Insufficient funds");

        tokenIds++;
        _safeMint(msg.sender, tokenIds);
    }

    /// @notice Public Mint
    /// @dev Presale must be over, there must be tokens remaining and must receive sufficient funds. Also contract must be unpaused.
    function mint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "Presale has not ended yet!"
        );
        require(tokenIds < maxTokenIds, "Mint Limit Exceeded");
        require(msg.value >= _price, "Insufficient funds");
        tokenIds++;
        _safeMint(msg.sender, tokenIds);
    }

    // Receive and Fallback for Eth transfers
    receive() external payable {}

    fallback() external payable {}

    /// @dev Override the Base URI in the ERC20 contract
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Called only by the owner to paused contract. Effects `mint()` and `presaleMint()`
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    /// @notice Used to pull funds in the smart contract to the deployer(owner only)
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send ether");
    }
}
