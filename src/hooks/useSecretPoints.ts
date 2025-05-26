import { useQuery } from '@tanstack/react-query';
import { useContract } from '../services/contract';
import { decrypt } from '../services/crypto';
import { useAccount } from 'wagmi';

export const useSecretPoints = () => {
  const { address } = useAccount();
  const { getContract } = useContract();

  return useQuery({
    queryKey: ['secretPoints', address],
    queryFn: async () => {
      if (!address) throw new Error('Wallet não conectada');
      const contract = getContract();
      const encryptedBalance = await contract.read.balanceOf([address]);
      return decrypt(encryptedBalance, address);
    },
    enabled: !!address,
    refetchInterval: 30000, // 30 segundos
  });
}; 