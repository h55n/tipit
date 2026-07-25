const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("\n🚀 Deploying TipJar contract");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Network:   ", hre.network.name);
  console.log("Deployer:  ", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:   ", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("Deployer wallet has no ETH — fund it from a Sepolia faucet first.");
  }

  console.log("\n📦 Compiling & deploying…");
  const TipJar = await hre.ethers.getContractFactory("TipJar");
  const tipJar = await TipJar.deploy();
  await tipJar.waitForDeployment();

  const address = await tipJar.getAddress();
  console.log("✅ TipJar deployed to:", address);

  // Write the address to a JSON file the frontend can import
  const deployInfo = {
    address,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outDir = path.join(__dirname, "..", "frontend");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "deployment.json"),
    JSON.stringify(deployInfo, null, 2)
  );

  console.log("\n📄 Deployment info written to frontend/deployment.json");
  console.log("\nNext steps:");
  console.log("  1. Verify on Etherscan:");
  console.log(`     npx hardhat verify --network ${hre.network.name} ${address}`);
  console.log("  2. Open frontend/index.html in a browser with MetaMask installed.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
