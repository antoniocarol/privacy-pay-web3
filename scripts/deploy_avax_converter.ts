import hre from "hardhat";

async function main() {

  try {
    const [walletClient] = await hre.viem.getWalletClients();

    if (walletClient && walletClient.account) {
    } else {
      console.error("ERRO: WalletClient ou conta não disponíveis.");
      process.exit(1); // Sair imediatamente se não houver conta
      return; // Necessário para type safety com TypeScript, embora process.exit já pare
    }
    
    const avaxConverter = await hre.viem.deployContract("AVAXConverter", [], { client: { wallet: walletClient } }); 
    
  } catch (error) {
    console.error("ERRO DETALHADO NO SCRIPT DE DEPLOY:", error);
    process.exitCode = 1;
  }
}

main()
  .then(() => {
    if (process.exitCode === undefined || process.exitCode === 0) {
      process.exit(0);
    } else {
      process.exit(process.exitCode);
    }
  })
  .catch((error) => {
    console.error("ERRO FATAL NÃO CAPTURADO NO SCRIPT DE DEPLOY:", error);
    process.exit(1);
  }); 