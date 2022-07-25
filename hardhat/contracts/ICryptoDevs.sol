// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICryptoDevs {
    /* returns a token ID owned by 'owner' at given 'index' of
  its token list. Use along with {balanceOf} to enumerate all
  of "owner"'s tokens 
  */
    function tokenOfOwnerByIndex(address owner, uint256 index)
        external
        view
        returns (uint256 tokenId);

    // returns the number of tokens in "owner"'s account
    function valancOf(address owner) external view returns (uint256 balance);
}
