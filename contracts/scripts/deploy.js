const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const GuardianAngel = await hre.ethers.getContractFactory("GuardianAngel");
  // Deploying with deployer as Admin and AI Agent (for simplicity in demo)
  const guardianAngel = await GuardianAngel.deploy(deployer.address, deployer.address);

  await guardianAngel.waitForDeployment();

  console.log("GuardianAngel deployed to:", await guardianAngel.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
