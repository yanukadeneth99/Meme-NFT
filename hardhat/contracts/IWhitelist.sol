//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/** 
@title Whitelist Contract Interface
@author Yanuka Deneth
@notice We only take the addressess which are whitelisted
*/
interface IWhitelist {
    /**
     * @notice Function to check if addressess are whitelist members
     * @dev Pass an adress to check if address is in whitelist
     * @return boolean, if true, the address is a whitelist
     */
    function whitelistedAddresses(address) external view returns (bool);
}
