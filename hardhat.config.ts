// hardhat.config.ts
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-viem");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AVAX_RPC_URL = process.env.AVAX_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

if (!PRIVATE_KEY) {
  console.warn("Chave privada (PRIVATE_KEY) não encontrada no .env. Deploy e transações não funcionarão.");
}
if (!process.env.AVAX_RPC_URL) {
  console.warn("AVAX_RPC_URL não encontrada no .env. Usando URL pública padrão para Fuji.");
}

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    fuji: {
      url: AVAX_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 43113,
    },
    avax: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.SNOWTRACE_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};

module.exports = config;
