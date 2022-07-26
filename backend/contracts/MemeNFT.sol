//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

/// @title Meme NFT Contract
/// @author Yanuka Deneth
/// @notice This is a ERC721A Contract for NFTs
contract MemeNFT is ERC721A, ERC721AQueryable, Ownable {
    /// @notice Holds the current NFTs, upto 255
    uint8 public MAX_NFT;

    /// @notice User can only mint 5 NFTs per wallet
    uint8 public constant MAX_NFT_MINT = 5;

    /// @notice Did whitelist start?
    bool public isWhitelistStarted;

    /// @notice holds the Base URI
    string private _uri;

    /// @notice Holds the time the whitelist should end
    uint256 endTimestamp;

    /// @notice Price of one NFT
    uint256 public constant preSalePrice = 0.01 ether;

    /// @notice Public Price of one NFT
    uint256 public constant pubSalePrice = 0.03 ether;

    /// @notice Holds the Whitelist Contract, only the `isWhitelisted()` function
    IWhitelist whitelistContract;

    /// @notice Modifier to make sure it's not a contract which calls
    modifier onlyEOA() {
        require(tx.origin == msg.sender, "Not an EOA");
        _;
    }

    /// @notice Initialises the NFT Name, Symbol, and Max NFT amount
    /// @param _max_nft The Max NFT Amount the contract holds which cannot be changed
    /// @param _whitelistAddress The Whitelist Deployed Contract address
    /// @param _nftUri The Base URI address for the NFT Metadata
    constructor(
        uint8 _max_nft,
        address _whitelistAddress,
        string memory _nftUri
    ) ERC721A("Meme NFT", "MNFT") {
        MAX_NFT = _max_nft;
        whitelistContract = IWhitelist(_whitelistAddress);
        _uri = _nftUri;
    }

    /// @notice Start Pre-sale by Contract Owner. Whitelist is up for 2 hours.
    function startPresale() external onlyOwner {
        isWhitelistStarted = true;
        endTimestamp = block.timestamp + 2 hours;
    }

    /// @notice Presale Mint
    function presaleMint(uint256 quantity) external payable onlyEOA {
        require(
            whitelistContract.isWhitelisted(msg.sender),
            "You are not a whitelist"
        );
        require(isWhitelistStarted, "Whitelist not started!");
        require(block.timestamp <= endTimestamp, "Whitelist is over!");
        require(
            quantity + _numberMinted(msg.sender) <= uint256(MAX_NFT_MINT),
            "Maximum NFTs aquired!"
        );
        require(
            quantity + _totalMinted() <= uint256(MAX_NFT),
            "Max NFTs Reached!"
        );
        require(
            msg.value == (preSalePrice * quantity),
            "Insufficient/Overexceeded Funds"
        );
        _mint(msg.sender, quantity);
    }

    /// @notice Mint a token
    function mint(uint256 quantity) external payable onlyEOA {
        require(block.timestamp > endTimestamp, "Whitelist is still running");
        require(isWhitelistStarted, "Mint is not open yet");
        require(
            quantity + _numberMinted(msg.sender) <= uint256(MAX_NFT_MINT),
            "Maximum NFTs aquired!"
        );
        require(
            quantity + _totalMinted() <= uint256(MAX_NFT),
            "Max NFTs Reached!"
        );
        require(
            msg.value == (pubSalePrice * quantity),
            "Insufficient/Overexceeded Funds"
        );
        _mint(msg.sender, quantity);
    }

    /// @notice Overriding the starting Token ID from 0 to 1
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    /// @notice Overriding the Base URI
    function _baseURI() internal view override returns (string memory) {
        return _uri;
    }

    /// @notice Overriding the TokenURI
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length != 0
                ? string(abi.encodePacked(baseURI, _toString(tokenId), ".json"))
                : "";
    }

    /// @notice Change the Base URI
    function change(string memory _nftURI) external onlyOwner {
        _uri = _nftURI;
    }

    /// @notice Change the Base URI and the Max NFTs
    function change(string memory _nftURI, uint8 _maxNFTs) external onlyOwner {
        _uri = _nftURI;
        MAX_NFT = _maxNFTs;
    }

    /// @notice Used to withdraw all cash out
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        address payable owner = payable(owner());
        (bool sent, ) = owner.call{value: amount}("");
        require(sent, "Error withdrawing ether");
    }

    receive() external payable {}

    fallback() external payable {}
}
