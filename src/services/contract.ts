import { getContract as viemGetContract } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useCallback } from 'react';
import { erc20Abi } from 'viem'           // 1 linha: ABI padrão do token
import AVAXConverterArtifact from '../../artifacts/contracts/AVAXConverter.sol/AVAXConverter.json';
import EERC20ConverterArtifact from '../../artifacts/contracts/EERC20Converter.sol/EERC20Converter.json';

// Configurações do contrato
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS; // Este é o endereço do EERC20Converter principal (ex: para USDCe)

// Flags para controle de modo (mock vs real)
const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_CONTRACT;

const EERC20_CONVERTER_ABI = EERC20ConverterArtifact.abi as any;
const AVAX_CONVERTER_ABI = AVAXConverterArtifact.abi as any;

// ABI do contrato EERC20Converter
const CONTRACT_ABI = [
  // ERC20 básico para tokens subjacentes
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // EERC20Converter específico
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'commitment', type: 'bytes32' },
    ],
    name: 'shield',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'nullifier', type: 'bytes32' },
      { name: 'newCommitment', type: 'bytes32' },
    ],
    name: 'privateTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'nullifier', type: 'bytes32' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'unshield',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'underlying',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Eventos
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'commitment', type: 'bytes32' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Shield',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'nullifier', type: 'bytes32' },
      { indexed: true, name: 'newCommitment', type: 'bytes32' }
    ],
    name: 'PrivateTransfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'nullifier', type: 'bytes32' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Unshield',
    type: 'event',
  }
] as const;

// Mock para ambiente de desenvolvimento
class MockContract {
  async write(method: string, args: any[]) {
    // Simulando tempo de processamento na blockchain
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retornando hash fictício para simular transação
    return {
      hash: `0x${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`,
      wait: async () => ({ status: 1 })
    };
  }
}

export function useContract() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Agora getContract pode receber o ABI específico a ser usado.
  // Se nenhum ABI for passado, ele assume o EERC20_CONVERTER_ABI para o CONTRACT_ADDRESS principal.
  const getContract = useCallback((contractAddress?: `0x${string}`, specificAbi?: any) => {
    if (USE_MOCK) {
      return {
        write: {
          shield: async (args: any[]) => new MockContract().write('shield', args),
          privateTransfer: async (args: any[]) => new MockContract().write('privateTransfer', args),
          unshield: async (args: any[]) => new MockContract().write('unshield', args),
          approve: async (args: any[]) => new MockContract().write('approve', args),
        },
        read: {
          balanceOf: async () => BigInt(0),
          underlying: async () => '0xd00ae08403B9bbb9124bB305C09058E32C39A48c' // Exemplo de underlying
        },
        abi: specificAbi || EERC20_CONVERTER_ABI // Mock também pode expor o abi usado
      };
    }
    
    if (!publicClient) {
      throw new Error('Client não disponível');
    }
    
    // Se contractAddress não for fornecido, usa o CONTRACT_ADDRESS (do EERC20Converter principal)
    const ADDRESS = contractAddress ?? CONTRACT_ADDRESS;
    if (!ADDRESS) {
      throw new Error('Endereço do contrato não configurado nem no .env principal nem passado como argumento');
    }
    
    // Usa specificAbi se fornecido, senão o EERC20_CONVERTER_ABI
    const abiToUse = specificAbi || EERC20_CONVERTER_ABI; 
    
    let clientForContract: any = publicClient; // Default to publicClient
    if (walletClient) {
      clientForContract = walletClient; // If walletClient exists, use it
    }

    if (!clientForContract) {
      throw new Error('Nenhum cliente (public ou wallet) disponível.');
    }
    
    return viemGetContract({
      address: ADDRESS as `0x${string}`,
      abi: abiToUse,
      client: clientForContract,
    });
  }, [publicClient, walletClient]);

   /** ----------------------------------------------------------------
     * Retorna um contrato ERC-20 "puro" para chamar approve/balanceOf
     * -----------------------------------------------------------------*/
   const getErc20 = useCallback(
    (tokenAddress: string) => {
      if (!publicClient) throw new Error('Client não disponível');
      // Para ERC20, o client pode ser apenas o publicClient para reads (balanceOf)
      // ou walletClient para writes (approve). ViemGetContract lida com isso.
      let clientForErc20: any = publicClient; // Default to publicClient
      if (walletClient) {
        clientForErc20 = walletClient; // If walletClient exists, use it
      }

      if (!clientForErc20) {
        throw new Error('Nenhum cliente (public ou wallet) disponível para ERC20.');
      }

      return viemGetContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        client: clientForErc20,
      });
    },
    [publicClient, walletClient],
  );

  return { getContract, getErc20, EERC20_CONVERTER_ABI, AVAX_CONVERTER_ABI };
} 