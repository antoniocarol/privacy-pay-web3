import { getContract as viemGetContract } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useCallback } from 'react';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'encryptedValue', type: 'string' },
    ],
    name: 'mint',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'decryptBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function useContract() {
  const publicClient = usePublicClient();
  useWalletClient();

  const getContract = useCallback(() => {
    if (!publicClient) throw new Error('Client não disponível');
    return viemGetContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      client: publicClient,
    });
  }, [publicClient]);

  return { getContract };
} 