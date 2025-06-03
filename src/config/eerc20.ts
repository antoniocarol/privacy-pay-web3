import { EERC } from '@avalabs/ac-eerc-sdk';
import { type PublicClient } from 'viem';
import { type WalletClient } from 'viem';
import { SDK_EERC_CIRCUIT_CONFIG } from './circuits';
import { generateProofSnarkJs } from '@/services/proofService';

// Endereço do contrato registrador na Fuji
export const REGISTRAR_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65' as const;

export async function createEERC20SDK(
  publicClient: PublicClient,
  walletClient: WalletClient,
  contractAddress: `0x${string}`,
  registrarAddress: `0x${string}` = REGISTRAR_ADDRESS,
  isConverter: boolean,
  circuitConfig = SDK_EERC_CIRCUIT_CONFIG
) {
  return new EERC(
    publicClient,
    walletClient,
    contractAddress,
    registrarAddress,
    isConverter,
    async (data: any, proofType: string) => {
      const config = circuitConfig[proofType as keyof typeof circuitConfig];
      if (!config) {
        throw new Error(`Configuração não encontrada para o circuito ${proofType}`);
      }

      return generateProofSnarkJs(
        config.wasm,
        config.zkey,
        data
      );
    },
    circuitConfig
  );
} 