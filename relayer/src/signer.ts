// ============================ signer.ts ============================
import 'dotenv/config';
import { http, createWalletClient, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';
import converterArtifact from '../../artifacts/contracts/EERC20Converter.sol/EERC20Converter.json';

const abi = (converterArtifact as any).abi as any;
const RPC_URL           = process.env.AVAX_RPC_URL!;
const RELAYER_KEY       = process.env.RELAYER_KEY as `0x${string}`;

const account = privateKeyToAccount(RELAYER_KEY);

export const walletClient = createWalletClient({
  chain: avalancheFuji,
  account,
  transport: http(RPC_URL),
});

export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(RPC_URL),
});

export function callPrivateTransfer(converterAddr: `0x${string}`, nullifier: `0x${string}`, newCommitment: `0x${string}`) {
  return walletClient.writeContract({
    address: converterAddr,
    abi,
    functionName: 'privateTransfer',
    args: [nullifier, newCommitment],
  });
}

export function callUnshield(converterAddr: `0x${string}`, nullifier: `0x${string}`, to: `0x${string}`, amount: bigint) {
  return walletClient.writeContract({
    address: converterAddr,
    abi,
    functionName: 'unshield',
    args: [nullifier, to, amount],
  });
}
