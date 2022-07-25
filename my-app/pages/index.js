import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  // create a BigNumber '0'
  const zero = BigNumber.from(0);

  // walletConnected keeps track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);

  // tokensToBeClaimed keeps track of the number of tokens that can be claimed
  // based on the Crypto Dev NFT's held by the user for which they haven't claimed the tokens
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);

  // balanceOfCryptoDevTokens keeps track of number of Crypto Dev tokens owned by an address
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);

  // amount of the tokens that the user wants to mint
  const [tokenAmount, setTokenAmount] = useState(zero);

  // tokensMinted is the total number of tokens that have been minted till now out of 10000(max total supply)
  const [tokensMinted, setTokensMinted] = useState(zero);

  // isOwner gets the owner of the contract through the signed address
  const [isOwner, setIsOwner] = useState(false);

  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  // true if you need signer, default false otherwise
  const getProviderOrSigner = async (needSigner = false) => {
    // connect to metamask
    // since we store 'web3modal' as a reference, we need to access the 'current' value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3provider = new providers.Web3Provider(provider);

    // if user not connected to rinkeby network, throw an error
    const { chainId } = await web3provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3provider.getSigner();
      return signer;
    }

    return web3provider;
  };

  // connects Metamask wallet
  const connectWallet = async () => {
    try {
      // when used for first time, prompts user to connect wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
}
