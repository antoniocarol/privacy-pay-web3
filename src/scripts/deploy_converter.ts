///======================================================================
///  DEPLOY SCRIPT (Hardhat) – salve em scripts/deploy_converter.ts
///======================================================================

import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!process.env.UNDERLYING_TOKEN) throw new Error("Define UNDERLYING_TOKEN env var");
  const Converter = await ethers.getContractFactory("EERC20Converter");
  const converter = await Converter.deploy(process.env.UNDERLYING_TOKEN);
  await converter.waitForDeployment();
  console.log("EERC20Converter deployed to", await converter.getAddress());
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
