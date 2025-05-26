import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContract } from '../services/contract';
import { encrypt } from '../services/crypto';
import { useAccount } from 'wagmi';
import type { MintPointsParams } from '../types/web3';

export const useMintPoints = () => {
  const { address } = useAccount();
  const { getContract } = useContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, recipient }: MintPointsParams) => {
      if (!address) throw new Error('Wallet não conectada');
      const contract = getContract();
      const encryptedValue = encrypt(amount.toString(), recipient);
      const tx = await contract.write.mint([amount, encryptedValue]);
      return tx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secretPoints', address] });
    },
  });
}; 