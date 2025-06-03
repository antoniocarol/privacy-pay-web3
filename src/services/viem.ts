import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'wagmi/chains';

/**
 * Cliente público VIEM compartilhado pela aplicação (leitura da blockchain)
 * Utiliza a Fuji Testnet por padrão, mas pode ser sobrescrito via .env
 */
const RPC_URL = import.meta.env.VITE_AVAX_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(RPC_URL),
}); 