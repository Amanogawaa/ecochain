import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

const main = async (): Promise<any> => {
  const EcoChainFactory: ContractFactory = await ethers.getContractFactory(
    "EcoChain"
  );
  const ecoChain: Contract = await EcoChainFactory.deploy();

  await ecoChain.deployed();
  console.log(`EcoChain deployed to: ${ecoChain.address}`);

  // Save contract address for later use
  const fs = require("fs");
  fs.writeFileSync("./ecochain-address.txt", ecoChain.address, {
    encoding: "utf8",
  });
  console.log(`Address saved to ecochain-address.txt`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
