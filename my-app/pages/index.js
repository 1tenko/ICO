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

  // checks balance of tokens that can be claimed by user
  const getTokensToBeClaimed = async () => {
    try {
      // get provider, no need for signer as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();

      // create instance of nft contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      // create instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      // get signer to extract address of the currently connected metamask account
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      // call balanceOf from the NFT contract to get number of NFTs held by user
      const balance = await nftContract.balanceOf(address);

      // balance is BigNumber so we compare it to 'zero
      if (balance === zero) {
        setTokensToBeClaimed(zero);
      } else {
        let amount = 0;

        // check fi tokens have been claimed for all NFT's
        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        // setTokensToBeClaimed initialized to bigNumber, so need to convert the amount
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  };

  // checks the balance of Crypto Dev Tokens held by an address
  const getBalanceOfCryptoDevTokens = async () => {
    try {
      // no need for signer as we are only reading state
      const provider = await getProviderOrSigner();

      // create instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      // ned signer to extract the address of currently connected account
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      // get number of tokens held by user
      const balance = await tokenContract.balanceOf(address);

      // balance is already big number so no need to convert it
      setBalanceOfCryptoDevTokens(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfCryptoDevTokens(zero);
    }
  };

  // mints 'amount' number of tokens to a given address
  const mintCryptoDevToken = async (amount) => {
    try {
      // need signer as this is a 'write' transaction
      const signer = await getProviderOrSigner(true);
      // create instance of token Contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      // each token is of '0.001 eth', the value we need to send is '0.001 * amount'
      const value = 0.001 * amount;

      const tx = await tokenContract.mint(amount, {
        // parsing '0.001' string to ether
        value: utils.parseEther(value.toString()),
      });

      setLoading(true);

      await tx.wait();
      setLoading(false);
      window.alert("Sucesfully minted Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  // helps user claim crypto dev tokens
  const claimCryptoDevTokens = async () => {
    try {
      // signer because it's a write transactions
      const signer = await getProviderOrSigner(true);

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.claim();

      setLoading(true);

      await tx.wait();
      setLoading(false);

      window.alert("Successfully claimed Crypto Dev Tokens");
      await getBalanceOfCryptoDevTokens();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();
    } catch (err) {
      console.error(err);
    }
  };

  // retrieves how many tokens have been minted till now out of total supply
  const getTotalTokensMinted = async () => {
    try {
      // no need for signer as we are only reading state from blockchain
      const provider = await getProviderOrSigner();

      // create instance of token contract
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      // get all tokens that have been minted
      const _tokensMinted = await tokenContract.totalSupply();
      setTokensMinted(_tokensMinted);
    } catch (err) {
      console.error(err);
    }
  };

  // gets the contract owner by connected address
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const _owner = await tokenContract.owner();

      // need signer to extract address of currently connected wallet
      const signer = await getProviderOrSigner(true);

      const address = await signer.getAddress();

      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // withdraws ether and tokens by calling withdraw function from contract
  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.withdraw();

      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // if wallet is not connected, create new instance of web3modal and connect wallet
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfCryptoDevTokens();
      getTokensToBeClaimed();
      withdrawCoins();
    }
  }, [walletConnected]);

  const renderButton = () => {
    // If we are currently waiting for something, return a loading button
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Loading...</button>
        </div>
      );
    }
    // if owner is connected, withdrawCoins() is called
    if (walletConnected && isOwner) {
      return (
        <div>
          <button className={styles.button1} onClick={withdrawCoins}>
            Withdraw Coins
          </button>
        </div>
      );
    }
    // If tokens to be claimed are greater than 0, Return a claim button
    if (tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed!
          </div>
          <button className={styles.button} onClick={claimCryptoDevTokens}>
            Claim Tokens
          </button>
        </div>
      );
    }
    // If user doesn't have any tokens to claim, show the mint button
    return (
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Amount of Tokens"
            // BigNumber.from converts the `e.target.value` to a BigNumber
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>

        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintCryptoDevToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(balanceOfCryptoDevTokens)}{" "}
                Crypto Dev Tokens
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(tokensMinted)}/10000 have been
                minted!!!
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
