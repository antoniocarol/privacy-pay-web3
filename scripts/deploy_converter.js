const { ethers } = require("hardhat");

async function main() {
  console.log("Iniciando deploy do EERC20Converter...");

  // Vamos usar um token ERC20 "fictício" para testes
  // Em um ambiente real, seria um token já existente na rede
  // Para teste, usaremos o endereço da Wrapped AVAX na Fuji
  const WAVAX_ADDRESS = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
  
  // Deploy EERC20Converter
  const EERC20Converter = await ethers.getContractFactory("EERC20Converter");
  const eerc20Converter = await EERC20Converter.deploy(WAVAX_ADDRESS);
  
  await eerc20Converter.waitForDeployment();
  
  const eerc20ConverterAddress = await eerc20Converter.getAddress();
  console.log(`EERC20Converter implantado no endereço: ${eerc20ConverterAddress}`);
  console.log(`Token ERC20 subjacente: ${WAVAX_ADDRESS} (Wrapped AVAX na Fuji)`);
  
  console.log("\nPara usar o contrato na aplicação:");
  console.log(`1. Atualize o VITE_CONTRACT_ADDRESS no arquivo .env com: ${eerc20ConverterAddress}`);
  console.log("2. Reinicie o servidor de desenvolvimento");
  
  return { eerc20ConverterAddress, erc20Address: WAVAX_ADDRESS };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 