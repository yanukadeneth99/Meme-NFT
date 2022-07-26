//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemeNFT is ERC721A, ERC721AQueryable, Ownable {
    /// @notice Holds the current NFTs, upto 255
    uint8 public constant _MAX_NFT;

    /// @notice Initialises the NFT Name, Symbol, and Max NFT amount
    constructor(uint8 _max_nft) ERC721A("Meme NFT", "MNFT") {
        _MAX_NFT = _max_nft;
    }

    function mint(uint256 quantity) external payable {
        // `_mint`'s second argument now takes in a `quantity`, not a `tokenId`.
        _mint(msg.sender, quantity);
    }
}
