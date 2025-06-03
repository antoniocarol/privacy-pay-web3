// scripts/relayer-demo.ts
import 'dotenv/config';     // carrega .env
import hre from 'hardhat';  // Runtime Environment
import abi from '../artifacts/contracts/EERC20Converter.sol/EERC20Converter.json' assert { type: 'json' };

async function main() {
  const { viem } = hre as any; // Cast hre to any to bypass type checking for viem
  if (!viem) {
    throw new Error("hre.viem não está definido. Verifique a importação de @nomicfoundation/hardhat-viem em hardhat.config.ts");
  }
  const [walletClient] = await viem.getWalletClients();
  const publicClient   = await viem.getPublicClient();

  if (!walletClient) throw new Error('WalletClient não encontrado (verifique PRIVATE_KEY)');
  if (!process.env.VITE_CONTRACT_ADDRESS) throw new Error('VITE_CONTRACT_ADDRESS ausente no .env');

  const CONVERTER = process.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

  // -------- 1. privateTransfer -------------------------------------------
  const nullifierA     = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
  const newCommitmentB = '0xfeedfacefeedfacefeedfacefeedfacefeedfacefeedfacefeedfacefeedface';

  const hash1 = await walletClient.writeContract({
    address: CONVERTER,
    abi,
    functionName: 'privateTransfer',
    args: [nullifierA, newCommitmentB],
  });
  await publicClient.waitForTransactionReceipt({ hash: hash1 });

  // -------- 2. unshield ---------------------------------------------------
  const nullifierB = '0xfeedfacefeedfacefeedfacefeedfacefeedfacefeedfacefeedfacefeedface';
  const recipient  = '0xB_CARTEIRA_PUB_TESTER';         // troque pelo endereço B real
  const amount     = 1_000_000n;                        // 1 USDC.e (6 dec)

  const hash2 = await walletClient.writeContract({
    address: CONVERTER,
    abi,
    functionName: 'unshield',
    args: [nullifierB, recipient as `0x${string}`, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash: hash2 });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
