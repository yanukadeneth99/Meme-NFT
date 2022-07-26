//SPDX-License-Identifier:MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Whitelist Contract
/// @author Yanuka Deneth
/// @notice This a contract which stores whitelist members and only enable them to do particular activities
contract Whitelist is Ownable {
    /// @dev Using the Counter library for current whitelist ID
    using Counters for Counters.Counter;

    /// @notice Holds the Max number of whitelists possible
    /// @dev Can only hold 255 values
    uint8 public maxWhitelistedAddresses;

    /// @notice Holds the current number of whitelists
    Counters.Counter private currentWhitelistcount;

    /// @notice Mapping of Addressess to whether they are whitelisted
    /// @dev true = is a whitelist
    mapping(address => bool) whitelistmap;

    /// @notice Emitted when users get added to whitelist, with the address
    event userWhitelisted(address indexed _address);

    /// @notice Emitted when a user was removed from whitelist
    event userRemoved(address indexed _address);

    /// @notice Sets the Maximum whitelists available
    /// @param _maxWhitelistedAddresses Number less than 255, greater than 1
    constructor(uint8 _maxWhitelistedAddresses) {
        require(
            _maxWhitelistedAddresses > 1 && _maxWhitelistedAddresses < 255,
            "Number not within bounds"
        );
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    /// @notice Is address a whitelist member?
    /// @param _address An Address to check if the address is a whitelist
    /// @return A boolean, if true, the address is a whitelist
    function isWhitelisted(address _address) external view returns (bool) {
        return whitelistmap[_address];
    }

    /// @notice Adds the calling Address as a whitelist provided there are available spots
    function joinWhitelist() external {
        require(!whitelistmap[msg.sender], "Address already a whitelist");
        require(
            currentWhitelistcount.current() < maxWhitelistedAddresses,
            "Max Whitelist amount reached!"
        );
        whitelistmap[msg.sender] = true;
        currentWhitelistcount.increment();
        emit userWhitelisted(msg.sender);
        assert(whitelistmap[msg.sender]);
    }

    /// @notice Removes the address from whitelist
    /// @dev Can be called only by owner
    function removeWhitelist(address _address) external onlyOwner {
        require(whitelistmap[_address], "Address not a whitelist!");
        delete whitelistmap[_address];
        currentWhitelistcount.decrement();
        emit userRemoved(_address);
        assert(!whitelistmap[_address]);
    }

    /// @notice Gets the current amount of whitelist taken
    function getNumberOfWhitelist() external view returns (uint256) {
        return currentWhitelistcount.current();
    }
}
