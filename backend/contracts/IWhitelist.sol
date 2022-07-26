//SPDX-License-Identifier:MIT
pragma solidity ^0.8.9;

interface IWhitelist {
    /// @dev Pass the address and you will get back whether the address is a whitelist
    function isWhitelisted(address _address) external view returns (bool);
}
