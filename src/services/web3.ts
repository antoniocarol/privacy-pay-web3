import { ethers } from 'ethers';
import type { SecretPointsContract } from '../types/web3';

const CONTRACT_ADDRESS = '0x...'; // Endereço do contrato eERC20 na Fuji
const CONTRACT_ABI = []; // ABI do contrato

export const getProvider = () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask não está instalado');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getContract = (): SecretPointsContract => {
  const provider = getProvider();
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer) as unknown as SecretPointsContract;
};

export const encryptValue = async (value: number, address: string): Promise<string> => {
  // Implementar criptografia AES
  return 'encrypted_value';
};

export const decryptValue = async (encryptedValue: string, address: string): Promise<number> => {
  // Implementar descriptografia AES
  return 0;
}; 