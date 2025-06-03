// scripts/deploy_converter.ts
const hre = require("hardhat");

async function main() {
    
    const underlyingTokenAddress = process.env.UNDERLYING_TOKEN_FOR_DEPLOY as `0x${string}`;
    if (!underlyingTokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(underlyingTokenAddress)) {
        console.error("ERRO: Endereço do token subjacente inválido ou não fornecido.");
        console.error("Defina a variável de ambiente UNDERLYING_TOKEN_FOR_DEPLOY antes de executar.");
        console.error("Ex: export UNDERLYING_TOKEN_FOR_DEPLOY=0xTOKEN_ADDRESS");
        process.exit(1);
        return;
    }

    try {
        const [walletClient] = await hre.viem.getWalletClients();
        
        if (walletClient && walletClient.account) {
        } else {
            console.error("ERRO: WalletClient ou conta não disponíveis.");
            process.exit(1); return; 
        }
        
        const eerc20Converter = await hre.viem.deployContract("EERC20Converter", [underlyingTokenAddress], { client: { wallet: walletClient } }); 
        
        const contractAddress = eerc20Converter.address;

        if (contractAddress) {
        } else {
            console.error("ERRO CRÍTICO: Endereço do contrato não foi obtido após o deploy.");
        }

    } catch (error) {
        console.error("ERRO DETALHADO NO SCRIPT DE DEPLOY (EERC20Converter):", error);
        process.exitCode = 1;
    }
}

// Apenas execute main se o script for chamado diretamente
if (require.main === module) {
    main().then(() => {
        if (process.exitCode === undefined || process.exitCode === 0) {
            process.exit(0);
        } else {
            process.exit(process.exitCode);
        }
    }).catch((error) => {
        console.error("\nERRO FATAL NÃO CAPTURADO (deploy_converter.ts):", error);
        process.exit(1);
    });
}
