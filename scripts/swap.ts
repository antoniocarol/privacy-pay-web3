import hre from "hardhat";
import type { HardhatRuntimeEnvironment } from 'hardhat/types';

async function main() {
  const localHre = hre as HardhatRuntimeEnvironment;
  const { ethers } = localHre;
  const to = process.env.SWAP_TO!;
  // Assegurar que ethers não é undefined
  if (!ethers) {
    throw new Error("ethers não está definido no hre. Verifique a configuração do Hardhat.");
  }
  const pavx = await ethers.getContractAt("PAVX", process.env.PAVX!);
  await pavx.faucet(to, ethers.parseUnits("10", 18));   // recebe 10 PAVX
}
main().catch(console.error); 