// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20, Ownable {
    // price of one CryptoDev token
    uint256 public constant tokenPrice = 0.001 ether;

    // Each NFT would give the user 10 tokens
    // It needs to be represented as 10 * (10 ** 18) as ERC20 tokens are represented by the smallest denomination possible for the token
    // By default, ERC20 tokens have the smallest denomination of 10^(-18). This means, having a balance of (1)
    // is actually equal to (10 ^ -18) tokens.
    // Owning 1 full token is equivalent to owning (10^18) tokens when you account for the decimal places.
    uint256 public constant tokensPerNFT = 10 * 10**18;

    // max total supply is 10000
    uint256 public constant maxTotalSupply = 10000 * 10**18;

    // CryptoDevsNFT contract instance
    ICryptoDevs CryptoDevsNFT;

    // mapping keeps track of which tokenIds have been claimed
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _cryptoDevsContract) ERC20("Crypto Dev Token", "CD") {
        CryptoDevsNFT = ICryptoDevs(_cryptoDevsContract);
    }

    // mints 'amount' number of CryptoDevTokens
    function mint(uint256 amount) public payable {
        // the value of ether that should be equal or greater than tokenPrice * amount
        uint256 _requiredAmount = tokenPrice * amount;

        // 'msg.value' should be equal or greater than the tokenPrice * amount
        require(msg.value >= _requiredAmount, "Ether sent is incorrect");

        // total tokens + amount <= 10000, otherwise revert the transaction
        uint256 amountWithDecimals = amount * 10**18;

        require(
            (totalSupply() + amountWithDecimals) <= maxTotalSupply,
            "Exceed sthe max total supply available"
        );

        // call the internal function from Openzeppelin's ERC20 contract
        _mint(msg.sender, amountWithDecimals);
    }
}
