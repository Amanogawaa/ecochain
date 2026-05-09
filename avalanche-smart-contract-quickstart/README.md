## Introduction

Avalanche is an open-source platform for launching decentralized applications and enterprise blockchain deployments in one interoperable, highly scalable ecosystem. Avalanche gives you complete control on both the network and application layers&mdash;helping you build anything you can imagine.

The Avalanche Network is composed of many blockchains. One of these blockchains is the C-Chain (Contract Chain), which is an Ethereum Virtual Machine instance. The C-Chain's API is almost identical to an Ethereum node's API. Avalanche offers the same interface as Ethereum but with higher speed, higher throughput, lower fees and lower transaction confirmation times. These properties considerably improve the performance of DApps and the user experience of smart contracts.

The goal of this guide is to lay out best practices regarding writing, testing and deployment of smart contracts to Avalanche's C-Chain. We'll be building smart contracts with development environment [Hardhat](https://hardhat.org).

## Prerequisites

### NodeJS and Yarn

First, install the LTS (long-term support) version of [nodejs](https://nodejs.org/en). This is `14.17.0` at the time of writing. NodeJS bundles `npm`.

Next, install [yarn](https://yarnpkg.com):

```zsh
npm install -g yarn
```

### AvalancheGo and Avash

[AvalancheGo](https://github.com/ava-labs/avalanchego) is an Avalanche node implementation written in Go. [Avash](https://docs.avax.network/build/tools/avash) is a tool to quickly deploy local test networks. Together, you can deploy local test networks and run tests on them.

### Solidity and Avalanche

It is also helpful to have a basic understanding of [Solidity](https://docs.soliditylang.org) and [Avalanche](https://docs.avax.network).

## Dependencies

Clone the [quickstart repository](https://github.com/ava-labs/avalanche-smart-contract-quickstart) and install the necessary packages via `yarn`.

```zsh
$ git clone https://github.com/avalanche-team1-philippines/avalanche-smart-contract-quickstart.git
$ cd avalanche-smart-contract-quickstart
$ yarn
```

## Write Contracts

Edit the `Coin.sol` contract in `contracts/`. `Coin.sol` is an [Open Zeppelin](https://openzeppelin.com) [ERC20](https://eips.ethereum.org/EIPS/eip-20) contract. ERC20 is a popular smart contract interface. You can also add your own contracts.

## Hardhat Config

Hardhat uses `hardhat.config.js` as the configuration file. You can define tasks, networks, compilers and more in that file. For more information see [here](https://hardhat.org/config/).

In our repository we use a pre-configured file [hardhat.config.ts](https://github.com/ava-labs/avalanche-smart-contract-quickstart/blob/main/hardhat.config.ts). This file configures necessary network information to provide smooth interaction with Avalanche. There are also some pre-defined private keys for testing on a local test network.

## Hardhat Tasks

You can define custom hardhat tasks in [hardhat.config.ts](https://github.com/ava-labs/avalanche-smart-contract-quickstart/blob/main/hardhat.config.ts).

## Deploy to Avalanche Fuji (Testnet)

This repo includes a deployment script (`scripts/deploy.ts`). It deploys the `ExampleERC20` contract and prints the new contract address.

### Step-by-step
1. Fund your wallet on Fuji with test AVAX (needed for gas)
   - Use the Fuji C-Chain faucet, for example: https://faucet.avax.network/
   - Make sure the faucet sends to the same address that matches your private key.

2. Get the **private key** for the wallet you want to deploy from
   - The private key is not the same thing as your public address.
   - Only get/export it from the wallet software you control (for example MetaMask).
   - If you use MetaMask:
     1. Switch MetaMask network to **Avalanche Fuji C-Chain**
     2. Click your account (top-right) -> **Account details**
     3. Click **Export private key**
     4. Enter your MetaMask password to confirm
     5. Copy the key (it should start with `0x`)
   - Keep it secret (do not commit it to git).

3. Set the environment variable for Hardhat
   - Your shell command must include the `0x` prefix:
     ```zsh
     export FUJI_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
     ```

4. Install dependencies and deploy
   - Install:
     ```zsh
     npm install
     ```
   - Deploy to Fuji:
     ```zsh
     npx hardhat run scripts/deploy.ts --network fuji
     ```

5. Copy the deployed contract address
   - The deploy script prints something like:
     `Coin deployed to: 0x...`

6. View the deployed contract on the Fuji explorer
   - SnowScan testnet (paste your address):
     https://testnet.snowscan.xyz/address/0xYOUR_CONTRACT_ADDRESS

Tip: If you run the deploy command again, you will deploy a fresh new contract instance (new address).

## Node.js Downgrade (Recommended)

If you see issues related to Hardhat/npm dependencies (for example `ERR_REQUIRE_ESM`), it helps to use an older Node version that matches the repo expectations.

### Steps (using `nvm`)
1. Switch Node to v16:
   ```zsh
   nvm install 16.20.2
   nvm use 16.20.2
   node -v
   ```
2. Clean and reinstall dependencies:
   ```zsh
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Compile and test:
   ```zsh
   npm run compile
   npx hardhat test
   ```

### If it still fails
1. If you still get `ERR_REQUIRE_ESM` on Node 16, the dependency tree is likely pulling an ESM-only package (commonly from `web3` / `cacheable-request` / `lowercase-keys`). Paste the full error stack so it can be pinned/fixed.
2. If `npm install` fails with a `node-gyp` error like `ModuleNotFoundError: No module named 'distutils'`, install build tooling in Python, then reinstall:
   ```zsh
   python3 -m pip install --upgrade setuptools wheel
   rm -rf node_modules package-lock.json
   npm install
   ```

## Documentation

There is a documentation under the Avalanche's official documentation repository:
[Using Hardhat with the Avalanche C-Chain](https://docs.avax.network/build/tutorials/smart-contracts/using-hardhat-with-the-avalanche-c-chain)
