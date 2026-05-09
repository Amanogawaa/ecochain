const hre = require("hardhat");

async function main() {
  const claimId = process.env.CLAIM_ID || "demo-claim-id";
  const donationId = process.env.DONATION_ID || "demo-donation-id";
  const contractAddress = process.env.ECOCHAIN_CONTRACT_ADDRESS;
  const rpcUrl = process.env.FUJI_RPC; // optional override

  if (!process.env.PRIVATE_KEY) {
    throw new Error("Set PRIVATE_KEY in env with a funded Fuji account");
  }
  if (!contractAddress) {
    throw new Error(
      "Set ECOCHAIN_CONTRACT_ADDRESS env to your deployed contract"
    );
  }

  // provider: use FUJI_RPC env if you want, otherwise use network config
  const provider = new hre.ethers.providers.JsonRpcProvider(
    rpcUrl || hre.network.config.url
  );
  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // ABI: either import the compiled ABI or inline the function ABI
  const abi = [
    "function recordVerifiedHandoff(string claimId, string donationId) returns (uint256)",
  ];

  const contract = new hre.ethers.Contract(contractAddress, abi, wallet);

  console.log("Calling recordVerifiedHandoff:", {
    claimId,
    donationId,
    contract: contractAddress,
  });
  const tx = await contract.recordVerifiedHandoff(claimId, donationId);
  console.log("txHash:", tx.hash);
  const receipt = await tx.wait();
  console.log("Mined in block", receipt.blockNumber);
  console.log("Receipt:", receipt);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
