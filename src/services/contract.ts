import { getContract as viemGetContract } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useCallback } from 'react';

// Configurações do contrato
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Flags para controle de modo (mock vs real)
const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_CONTRACT;

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
    
    console.log(`Mock Contract ${method} called with:`, args);
    
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

  const getContract = useCallback(() => {
    if (USE_MOCK) {
      console.log('Usando contrato MOCK para desenvolvimento');
      // Retornar contrato mock para desenvolvimento
      return {
        write: {
          shield: async (args: any[]) => new MockContract().write('shield', args),
          privateTransfer: async (args: any[]) => new MockContract().write('privateTransfer', args),
          unshield: async (args: any[]) => new MockContract().write('unshield', args),
          approve: async (args: any[]) => new MockContract().write('approve', args),
          underlying: async () => '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'
        },
        read: {
          balanceOf: async () => BigInt(0),
          underlying: async () => '0xd00ae08403B9bbb9124bB305C09058E32C39A48c'
        }
      };
    }
    
    // Contrato real para produção
    if (!publicClient) {
      throw new Error('Client não disponível');
    }
    
    if (!CONTRACT_ADDRESS) {
      throw new Error('Endereço do contrato não configurado');
    }
    
    console.log('Usando contrato REAL no endereço:', CONTRACT_ADDRESS);
    
    return viemGetContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      client: publicClient,
    });
  }, [publicClient]);

  return { getContract };
} 