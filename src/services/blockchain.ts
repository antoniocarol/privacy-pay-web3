import { publicClient } from "@/services/viem";        // cliente compartilhado
import { parseAbiItem, formatUnits } from "viem";
import { TOKENS } from "@/config/tokens"; // Importar TOKENS
import type { Transaction } from "@/components/TransactionListUtils"; // Corrigido o caminho
import { type SecretData } from "@/hooks/useEERC20"; // <<< ADICIONADO IMPORT

const evShield = parseAbiItem(
  "event Shield(bytes32 indexed commitment, uint256 amount)" // Assumindo que AVAXConverter também emitirá amount
);
const evPriv   = parseAbiItem(
  "event PrivateTransfer(bytes32 indexed nullifier, bytes32 indexed newCommitment)"
);
const evUnshield = parseAbiItem(
  "event Unshield(bytes32 indexed nullifier, address indexed to, uint256 amount)"
);

const MAX_BLOCK_RANGE_RPC = 2048; // Limite do RPC da Fuji
const HISTORY_CHUNK_SIZE = 2000; // Tamanho do chunk para busca, < MAX_BLOCK_RANGE_RPC
const MAX_TOTAL_BLOCKS_TO_SCAN = 200000; // Profundidade máxima total de busca

export async function fetchHistory(userAddress: `0x${string}`): Promise<Transaction[]> {
  let allTransactions: Transaction[] = [];

  const storedSecretsRaw = localStorage.getItem("privacy-pay-secrets");
  let commitsObject: Record<string, SecretData> = {};

  if (storedSecretsRaw) {
    try {
      const parsedStoredSecrets: { value: Record<string, SecretData>, expiry?: number } = JSON.parse(storedSecretsRaw);
      if (parsedStoredSecrets && typeof parsedStoredSecrets.value === 'object') {
        if (parsedStoredSecrets.expiry && parsedStoredSecrets.expiry < new Date().getTime()) {
          console.warn('[fetchHistory] privacy-pay-secrets expirado.');
        } else {
          commitsObject = parsedStoredSecrets.value;
        }
      }
    } catch (e) {
      console.error("[fetchHistory] Erro ao parsear 'privacy-pay-secrets':", e);
    }
  }
  console.log('[fetchHistory] commitsObject from localStorage:', JSON.parse(JSON.stringify(commitsObject)));

  const myNotesArray: SecretData[] = Object.values(commitsObject);
  console.log('[fetchHistory] myNotesArray:', JSON.parse(JSON.stringify(myNotesArray)));
  
  const myCommitments = myNotesArray
    .map(n => n.commitment as `0x${string}`)
    .filter(c => c && typeof c === 'string' && c.startsWith('0x'));
  const mySpentNullifiers = myNotesArray
    .filter(n => n.spent) 
    .map(n => n.nullifier as `0x${string}`)
    .filter(n => n && typeof n === 'string' && n.startsWith('0x'));

  console.log('[fetchHistory] myCommitments:', myCommitments);
  console.log('[fetchHistory] mySpentNullifiers:', mySpentNullifiers);

  const getBlockTimestamp = async (blockHash: `0x${string}` | null | undefined): Promise<number | undefined> => {
    if (!blockHash) return undefined;
    try {
      const block = await publicClient.getBlock({ blockHash });
      return Number(block.timestamp);
    } catch (e) {
      console.warn(`[getBlockTimestamp] Failed to get block for hash ${blockHash}:`, e);
      return undefined;
    }
  };

  const latestBlockFetched = await publicClient.getBlockNumber();
  const earliestBlockToScan = latestBlockFetched > BigInt(MAX_TOTAL_BLOCKS_TO_SCAN) ? latestBlockFetched - BigInt(MAX_TOTAL_BLOCKS_TO_SCAN) : 0n;

  for (const tokenCfg of TOKENS) {
    if (tokenCfg.converter) {
      const converterAddress = tokenCfg.converter;
      const tokenDecimals = tokenCfg.decimals;
      const tokenSymbol = tokenCfg.symbol;
      console.log(`[fetchHistory] Processing token: ${tokenSymbol} with converter address: ${converterAddress}. Scanning from approx block ${earliestBlockToScan} to ${latestBlockFetched}`);

      // Loop para buscar logs em chunks
      let currentToBlock = latestBlockFetched;
      while (currentToBlock >= earliestBlockToScan) {
        let chunkFromBlock = currentToBlock - BigInt(HISTORY_CHUNK_SIZE - 1);
        if (chunkFromBlock < earliestBlockToScan) {
          chunkFromBlock = earliestBlockToScan;
        }

        // Garante que não ultrapassemos o latestBlockFetched na primeira iteração se o range total for menor que um chunk
        if (chunkFromBlock < 0n) chunkFromBlock = 0n; // Segurança para não ir abaixo do bloco 0
        if (currentToBlock < chunkFromBlock) break; // Condição de segurança para evitar loop invertido

        console.log(`[fetchHistory] Token ${tokenSymbol}: Scanning from block ${chunkFromBlock} to ${currentToBlock}`);

        // SHIELD LOGS
        try {
          const shieldLogsRaw = await publicClient.getLogs({
            address: converterAddress,
            event: evShield,
            fromBlock: chunkFromBlock,
            toBlock: currentToBlock
          });
          // console.log(`[fetchHistory] shieldLogsRaw for ${tokenSymbol} chunk ${chunkFromBlock}-${currentToBlock}:`, shieldLogsRaw);
          const userShieldLogs = shieldLogsRaw.filter(log => log.args.commitment && myCommitments.includes((log.args.commitment as string).toLowerCase() as `0x${string}`));
          for (const log of userShieldLogs) {
            const blockTimestamp = await getBlockTimestamp(log.blockHash);
            allTransactions.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'history.type.deposit',
              date: blockTimestamp ? new Date(blockTimestamp * 1000).toISOString() : 'history.status.soon',
              value: parseFloat(formatUnits(log.args.amount ?? 0n, tokenDecimals)),
              status: 'history.status.confirmed',
              hash: log.transactionHash,
              tokenSymbol: tokenSymbol,
              decimals: tokenDecimals,
              blockTimestamp: blockTimestamp
            } as Transaction);
          }
        } catch (error) {
          console.error(`[fetchHistory] ERRO ao buscar Shield logs for ${tokenSymbol} in chunk ${chunkFromBlock}-${currentToBlock}:`, error);
        }

        // PRIVATE TRANSFER LOGS (INCOMING & OUTGOING)
        try {
          if (myCommitments.length > 0) {
            const incomingPrivateTransfers = await publicClient.getLogs({
              address: converterAddress,
              event: evPriv,
              args: { newCommitment: myCommitments.map(c => c.toLowerCase()) as `0x${string}`[] },
              fromBlock: chunkFromBlock,
              toBlock: currentToBlock
            });
            // console.log(`[fetchHistory] incomingPrivateTransfers for ${tokenSymbol} chunk ${chunkFromBlock}-${currentToBlock}:`, incomingPrivateTransfers);
            for (const log of incomingPrivateTransfers) {
              const receivedNote = myNotesArray.find(n => (n.commitment as string).toLowerCase() === (log.args.newCommitment as string).toLowerCase());
              const isOurSpentNullifier = mySpentNullifiers.includes((log.args.nullifier as string).toLowerCase() as `0x${string}`);
              if (!isOurSpentNullifier) {
                const blockTimestamp = await getBlockTimestamp(log.blockHash);
                const value = receivedNote ? parseFloat(formatUnits(BigInt(receivedNote.amount), receivedNote.decimals)) : 0;
                allTransactions.push({
                  id: `${log.transactionHash}-${log.logIndex}-in`,
                  type: 'history.type.received',
                  date: blockTimestamp ? new Date(blockTimestamp * 1000).toISOString() : 'history.status.soon',
                  value: value,
                  status: 'history.status.confirmed',
                  hash: log.transactionHash,
                  tokenSymbol: receivedNote?.tokenSymbol || tokenSymbol,
                  decimals: receivedNote?.decimals || tokenDecimals,
                  blockTimestamp: blockTimestamp
                } as Transaction);
              }
            }
          }
          if (mySpentNullifiers.length > 0) {
            const outgoingPrivateTransfers = await publicClient.getLogs({
              address: converterAddress,
    event: evPriv,
              args: { nullifier: mySpentNullifiers.map(n => n.toLowerCase()) as `0x${string}`[] },
              fromBlock: chunkFromBlock,
              toBlock: currentToBlock
            });
            // console.log(`[fetchHistory] outgoingPrivateTransfers for ${tokenSymbol} chunk ${chunkFromBlock}-${currentToBlock}:`, outgoingPrivateTransfers);
            for (const log of outgoingPrivateTransfers) {
              if (log.args.newCommitment && myCommitments.includes((log.args.newCommitment as string).toLowerCase() as `0x${string}`)) {
                // console.log(`[fetchHistory] Skipping outgoing as change note for ${tokenSymbol}:`, log);
                continue;
              }
              const blockTimestamp = await getBlockTimestamp(log.blockHash);
              const spentNoteOriginal = myNotesArray.find(n => (n.nullifier as string).toLowerCase() === (log.args.nullifier as string).toLowerCase());
              let valueSent = 0;
              if (spentNoteOriginal) {
                valueSent = -parseFloat(formatUnits(BigInt(spentNoteOriginal.amount), spentNoteOriginal.decimals));
              }
              allTransactions.push({
                id: `${log.transactionHash}-${log.logIndex}-out`,
                type: 'history.type.sent',
                date: blockTimestamp ? new Date(blockTimestamp * 1000).toISOString() : 'history.status.soon',
                value: valueSent,
                status: 'history.status.confirmed',
                hash: log.transactionHash,
                tokenSymbol: spentNoteOriginal ? spentNoteOriginal.tokenSymbol : tokenSymbol,
                decimals: spentNoteOriginal ? spentNoteOriginal.decimals : tokenDecimals,
                blockTimestamp: blockTimestamp
              } as Transaction);
            }
          }
        } catch (error) {
          console.error(`[fetchHistory] ERRO ao buscar PrivateTransfer logs for ${tokenSymbol} in chunk ${chunkFromBlock}-${currentToBlock}:`, error);
        }

        // UNSHIELD LOGS
        try {
          const unshieldLogsRaw = await publicClient.getLogs({
            address: converterAddress,
    event: evUnshield,
            args: { to: userAddress },
            fromBlock: chunkFromBlock,
            toBlock: currentToBlock
          });
          // console.log(`[fetchHistory] unshieldLogsRaw for ${tokenSymbol} (to: ${userAddress}) chunk ${chunkFromBlock}-${currentToBlock}:`, unshieldLogsRaw);
          for (const log of unshieldLogsRaw) {
            const blockTimestamp = await getBlockTimestamp(log.blockHash);
            allTransactions.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'history.type.withdrawal',
              date: blockTimestamp ? new Date(blockTimestamp * 1000).toISOString() : 'history.status.soon',
              value: parseFloat(formatUnits(log.args.amount ?? 0n, tokenDecimals)),
              status: 'history.status.confirmed',
              hash: log.transactionHash,
              tokenSymbol: tokenSymbol,
              decimals: tokenDecimals,
              blockTimestamp: blockTimestamp
            } as Transaction);
          }
        } catch (error) {
          console.error(`[fetchHistory] ERRO ao buscar Unshield logs for ${tokenSymbol} in chunk ${chunkFromBlock}-${currentToBlock}:`, error);
        }
        
        // Prepara para o próximo chunk
        currentToBlock = chunkFromBlock - 1n;
        if (chunkFromBlock === earliestBlockToScan) break; // Sai do loop se já escaneamos até o mais antigo necessário
      }
    }
  }
  // Ordenar transações por timestamp (mais recentes primeiro)
  allTransactions.sort((a, b) => {
    const dateA = a.blockTimestamp ?? 0;
    const dateB = b.blockTimestamp ?? 0;
    return dateB - dateA;
  });
  console.log("[fetchHistory] FINAL allTransactions (after chunking and sorting):", JSON.parse(JSON.stringify(allTransactions)));
  return allTransactions;
}
