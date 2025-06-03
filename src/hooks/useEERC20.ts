import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContract } from "../services/contract";
import { postSendEncryptedNote, postUnshield, getEncryptedNotes, EncryptedNoteResponse } from "../services/relayerClient";
import { cryptoService } from "../services/crypto";
import { useToast } from "../providers/ToastProvider";
import { useLocalStorage } from "./useLocalStorage";
import { SupportedToken } from "@/config/tokens";
import { erc20Abi } from 'viem';
import { encryptDataForRecipient, decryptSealedBoxData } from '@/services/encryptionService';

/** Endereço do contrato Converter implantado na rede */
// const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`; // Comentado pois não é usado diretamente aqui agora

/** Estrutura persistida no localStorage para cada nota privada */
export interface SecretData {
  nullifier: string;
  secret: string;
  amount: string; // 1 USDC = "1000000" (6 dec)
  commitment: string;
  timestamp: number;
  spent: boolean;
  tokenSymbol: string;
  converterAddress: string;
  decimals: number;
}

export function useEERC20(tokenCfg?: SupportedToken) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: walletClient } = useWalletClient();

  const { getContract, getErc20, EERC20_CONVERTER_ABI, AVAX_CONVERTER_ABI } = useContract();

  /* ------------------------------------------------------------------
   * Local storage (compromissos não gastos)
   * ----------------------------------------------------------------*/
  const [secretStore, setSecretStore] = useLocalStorage<Record<string, SecretData>>(
    "privacy-pay-secrets",
    {},
  );

  /* ------------------------------------------------------------------
   * Flags de UI
   * ----------------------------------------------------------------*/
  const [isShielding, setIsShielding] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isUnshielding, setIsUnshielding] = useState(false);
  const [isFetchingNotes, setIsFetchingNotes] = useState(false);

  /* ------------------------------------------------------------------
   * Saldo privado (somando notas não gastas)
   * ----------------------------------------------------------------*/
  const { data: privateBalance } = useQuery({
    queryKey: ["private-balance", address, secretStore, tokenCfg?.symbol],
    queryFn: () => {
      if (!address || !tokenCfg) return "0";
      const sum = Object.values(secretStore)
        .filter((n) => !n.spent && n.tokenSymbol === tokenCfg.symbol && n.converterAddress === tokenCfg.converter)
        .reduce((s, n) => s + BigInt(n.amount), 0n); 
      return sum.toString();
    },
    enabled: !!address && !!tokenCfg,
  });

  /* ------------------------------------------------------------------
   * Token subjacente
   * ----------------------------------------------------------------*/
  const underlyingAddress = tokenCfg?.erc20;

  const { data: underlyingToken } = useQuery({
    queryKey: ["underlying-token", tokenCfg?.symbol, tokenCfg?.converter],
    queryFn: async () => {
      if (!tokenCfg) return null;
      if (tokenCfg.isNative) return '0xNATIVE';
      if (tokenCfg.erc20 && tokenCfg.erc20 !== '0xNATIVE') return tokenCfg.erc20;
      // Se não for nativo e não tiver erc20 definido, tenta ler do contrato EERC20Converter
      const converterContract = getContract(tokenCfg.converter, EERC20_CONVERTER_ABI) as any;
      return converterContract.read.underlying();
    },
    enabled: !!tokenCfg,
    staleTime: Infinity,
  });

  /* ------------------------------------------------------------------
   * Approve (executado no token)
   * ----------------------------------------------------------------*/
  const approveTokens = useMutation({
    mutationFn: async (amount: string) => {
      if (!tokenCfg || tokenCfg.isNative) return; // Não aprova para nativo
      if (!address) throw new Error("Wallet não conectada");
      if (!underlyingToken || underlyingToken === '0xNATIVE') throw new Error("Token subjacente indefinido para aprovação");
      if (!tokenCfg.converter) throw new Error("Endereço do conversor não definido para aprovação");
      if (!walletClient || !walletClient.account || !walletClient.chain) {
        throw new Error("Wallet client não está totalmente configurado para approve");
      }

      const hash = await walletClient.writeContract({
        address: underlyingToken as `0x${string}`, // Endereço do token ERC20
        abi: erc20Abi, // ABI padrão do ERC20
        functionName: 'approve',
        args: [tokenCfg.converter, BigInt(amount)], // spender, amount
        chain: walletClient.chain,
        account: walletClient.account,
      });

      await publicClient?.waitForTransactionReceipt({ hash });
      return hash;
    },
  });

  /* ------------------------------------------------------------------
   * SHIELD
   * ----------------------------------------------------------------*/
  const shield = useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!address || !walletClient) throw new Error("Wallet não conectada");
      if (!tokenCfg) throw new Error("Configuração do token não fornecida para shield");
      setIsShielding(true);
      try {
        if (!tokenCfg.isNative) {
          showToast("Aprovando tokens…", "info");
          await approveTokens.mutateAsync(amount); 
        }

        const { commitment, nullifier, secret } = cryptoService.generateShieldCommitment(amount, address);
        showToast("Enviando shield…", "info");

        let txHash: `0x${string}`;
        if (tokenCfg.isNative) {
          if (!walletClient.chain) throw new Error("Chain não definida no walletClient");
          if (!walletClient.account) throw new Error("Account não definida no walletClient");
          if (!AVAX_CONVERTER_ABI) throw new Error("ABI do AVAX Converter não carregado");
          if (!tokenCfg.converter) throw new Error("Endereço do AVAX Converter não definido em tokenCfg");

          txHash = await walletClient.writeContract({
            address: tokenCfg.converter, 
            abi: AVAX_CONVERTER_ABI,     
            functionName: 'shield',
            args: [commitment],          
            value: BigInt(amount),
            chain: walletClient.chain,
            account: walletClient.account,
          });
        } else {
          if (!EERC20_CONVERTER_ABI) throw new Error("ABI do EERC20 Converter não carregado");
          if (!tokenCfg.converter) throw new Error("Endereço do EERC20 Converter não definido em tokenCfg");
          
          // Para ERC20, usamos o EERC20_CONVERTER_ABI
          // A função shield do EERC20Converter espera (amount, commitment)
          // Precisamos chamar writeContract diretamente aqui também para consistência ou usar o helper getContract.
          // Usando writeContract diretamente:
          txHash = await walletClient.writeContract({
            address: tokenCfg.converter,
            abi: EERC20_CONVERTER_ABI,
            functionName: 'shield',
            args: [BigInt(amount), commitment], // amount deve ser BigInt aqui também
            chain: walletClient.chain,       // Adicionar chain e account
            account: walletClient.account,
          });
        }
        
        await publicClient?.waitForTransactionReceipt({ hash: txHash });

        const secretId = `${nullifier.slice(0, 8)}-${Date.now()}`;
        setSecretStore((prev) => ({
          ...prev,
          [secretId]: { 
            nullifier, 
            secret, 
            amount, 
            commitment, 
            timestamp: Date.now(), 
            spent: false, 
            tokenSymbol: tokenCfg.symbol,
            converterAddress: tokenCfg.converter as string,
            decimals: tokenCfg.decimals
          },
        }));
        return { txHash, secretId } as const;
      } finally {
        setIsShielding(false);
      }
    },
    onSuccess: ({ secretId }) => {
      showToast(`Shield concluído! ID: ${secretId}`, "success");
      queryClient.invalidateQueries({ queryKey: ["private-balance", address] });
      queryClient.invalidateQueries({ queryKey: ["history", address] });
    },
    onError: (e) => showToast((e as Error).message, "error"),
  });

  /* ------------------------------------------------------------------
   * PRIVATE TRANSFER via Relayer
   * ----------------------------------------------------------------*/
  const privateTransfer = useMutation({
    mutationFn: async ({ secretId, amount, recipient, recipientEncKey }: { 
      secretId: string; 
      amount: string; 
      recipient: string; // Este é o recipientWalletAddress
      recipientEncKey: string; 
    }) => {
      if (!address) throw new Error("Wallet não conectada");
      if (!tokenCfg || !tokenCfg.converter) throw new Error("Token ou conversor não configurado para esta operação.");

      const note = secretStore[secretId];
      if (!note) throw new Error("Nota não encontrada");
      if (note.spent) throw new Error("Nota já gasta");
      if (BigInt(amount) > BigInt(note.amount)) throw new Error("Valor da transferência excede o valor da nota.");
      if (note.converterAddress !== tokenCfg.converter) {
        throw new Error("A nota selecionada não pertence ao conversor do token atualmente selecionado para a transferência.");
      }

      setIsTransferring(true);
      try {
        const originalNoteData = {
          nullifier: note.nullifier,
          secret: note.secret,
          amount: note.amount,
          userAddress: address, 
        };

        const transferResult = cryptoService.createPrivateTransferData(originalNoteData, amount, recipient);

        const noteDataForRecipient = {
          secret: transferResult.secretForRecipient,
          nullifier: transferResult.nullifierForRecipient,
          amount: amount, 
          tokenSymbol: note.tokenSymbol,
          decimals: note.decimals,
          converterAddress: note.converterAddress,
          commitment: transferResult.commitmentForRecipient 
        };

        const encryptedNotePayload = encryptDataForRecipient(noteDataForRecipient, recipientEncKey);

        if (!encryptedNotePayload) {
          throw new Error("Falha ao encriptar os dados da nota para o destinatário.");
        }

        showToast("Enviando transação e dados encriptados ao relayer…", "info");
        
        // Chamar o novo endpoint do relayer
        const txHash = await postSendEncryptedNote({
          recipientWalletAddress: recipient, // O `recipient` aqui é o endereço da carteira do destinatário
          encryptedNotePayload: encryptedNotePayload,
          commitmentForRecipient: transferResult.commitmentForRecipient,
          nullifierToSpend: transferResult.nullifierToSpend,
          converterAddress: note.converterAddress
        });
        
        await publicClient?.waitForTransactionReceipt({ hash: txHash });

        setSecretStore((prev) => {
          const copy = { ...prev };
          copy[secretId].spent = true; // Marca a nota original como gasta
          
          // Adiciona a nota de troco para o remetente, se houver
          if (transferResult.changeNoteData) {
            const { commitment, secret, nullifier, amount: changeAmount } = transferResult.changeNoteData;
            const changeNoteId = `change-${note.tokenSymbol}-${Date.now()}`;
            
            const newChangeNote: SecretData = {
              nullifier,
              secret,
              commitment,
              amount: changeAmount,
              timestamp: Date.now(),
              spent: false,
              tokenSymbol: note.tokenSymbol, // Troco é do mesmo token
              converterAddress: note.converterAddress, // Mesmo conversor
              decimals: note.decimals // Mesmas decimais
            };
            copy[changeNoteId] = newChangeNote;
          }
          return copy;
        });
        return { txHash } as const;
      } finally {
        setIsTransferring(false);
      }
    },
    onSuccess: () => {
      showToast("Transferência privada concluída", "success");
      queryClient.invalidateQueries({ queryKey: ["private-balance", address] });
      queryClient.invalidateQueries({ queryKey: ["history", address] });
    },
    onError: (e) => showToast((e as Error).message, "error"),
  });

  /* ------------------------------------------------------------------
   * UNSHIELD via Relayer
   * ----------------------------------------------------------------*/
  const unshield = useMutation({
    mutationFn: async ({ secretId, amount }: { secretId: string; amount: string }) => {
      if (!address) throw new Error("Wallet não conectada");
      const note = secretStore[secretId];
      if (!note) throw new Error("Nota não encontrada");
      if (note.spent) throw new Error("Nota já gasta");
      if (Number(note.amount) < Number(amount)) throw new Error("Saldo insuficiente");

      setIsUnshielding(true);
      try {
        showToast("Enviando unshield…", "info");
        const txHash = await postUnshield({ 
          nullifier: note.nullifier, 
          recipient: address, 
          amount: amount.toString(), 
          converterAddress: note.converterAddress
        });
        await publicClient?.waitForTransactionReceipt({ hash: txHash });

        setSecretStore((prev) => {
          const copy = { ...prev };
          copy[secretId].spent = true;
          const change = BigInt(note.amount) - BigInt(amount);
          if (change > 0n) {
            const c = cryptoService.generateShieldCommitment(change.toString(), address);
            const changeNoteId = `unshield-change-${Date.now()}`;
            copy[changeNoteId] = { 
              ...c, 
              amount: change.toString(), 
              timestamp: Date.now(), 
              spent: false,
              tokenSymbol: note.tokenSymbol,
              converterAddress: note.converterAddress,
              decimals: note.decimals
            };
          }
          return copy;
        });
        return { txHash } as const;
      } finally {
        setIsUnshielding(false);
      }
    },
    onSuccess: () => {
      showToast("Unshield concluído! Tokens públicos recebidos", "success");
      queryClient.invalidateQueries({ queryKey: ["private-balance", address] });
    },
    onError: (e) => showToast((e as Error).message, "error"),
  });

  /* ------------------------------------------------------------------
   * FETCH AND PROCESS ENCRYPTED NOTES (para o destinatário)
   * ----------------------------------------------------------------*/
  const fetchAndProcessEncryptedNotes = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Wallet não conectada para buscar notas.");
      setIsFetchingNotes(true);
      let notesProcessedCount = 0;
      let notesFailedCount = 0;
      try {
        showToast("Buscando novas notas privadas...", "info");
        const encryptedNotesFromRelayer = await getEncryptedNotes(address);

        if (encryptedNotesFromRelayer.length === 0) {
          showToast("Nenhuma nota privada nova encontrada.", "info");
          return { notesProcessedCount, notesFailedCount };
        }

        const newSecretsToAdd: Record<string, SecretData> = {};

        for (const encNote of encryptedNotesFromRelayer) {
          const decryptedNoteData = decryptSealedBoxData(encNote.encryptedData);

          if (decryptedNoteData) {
            // Verificar se o commitment bate
            const noteCommitmentInPayload = (decryptedNoteData as any).commitment;
            if (noteCommitmentInPayload !== encNote.commitment) {
              console.error(
                `[Receiver] Commitment mismatch! Relayer: ${encNote.commitment}, Payload: ${noteCommitmentInPayload}`,
                decryptedNoteData
              );
              showToast(`Erro ao processar nota: commitment não confere (ID: ${encNote.commitment.slice(0,8)})`, "error");
              notesFailedCount++;
              continue;
            }
            
            // Garantir que todos os campos esperados pela SecretData estão presentes
            const { nullifier, secret, amount, tokenSymbol, decimals, converterAddress, commitment } = decryptedNoteData as Omit<SecretData, 'timestamp' | 'spent'>;

            if (!nullifier || !secret || !amount || !tokenSymbol || !decimals || !converterAddress || !commitment) {
              console.error("[Receiver] Dados decriptados incompletos:", decryptedNoteData);
              showToast(`Erro ao processar nota: dados incompletos (ID: ${encNote.commitment.slice(0,8)})`, "error");
              notesFailedCount++;
              continue;
            }

            const secretId = `received-${nullifier.slice(0, 8)}-${Date.now()}`;
            newSecretsToAdd[secretId] = {
              nullifier,
              secret,
              amount,
              commitment,
              timestamp: Date.now(),
              spent: false,
              tokenSymbol,
              converterAddress,
              decimals,
            };
            notesProcessedCount++;
          } else {
            console.warn(`[Receiver] Falha ao decriptar nota com commitment: ${encNote.commitment}`);
            showToast(`Falha ao decriptar nota (ID: ${encNote.commitment.slice(0,8)})`, "warning");
            notesFailedCount++;
          }
        }

        if (Object.keys(newSecretsToAdd).length > 0) {
          setSecretStore((prev) => ({ ...prev, ...newSecretsToAdd }));
        }

        if (notesProcessedCount > 0) {
          showToast(`${notesProcessedCount} nova(s) nota(s) privada(s) adicionada(s)!`, "success");
        }
        if (notesFailedCount > 0 && notesProcessedCount === 0) {
          showToast("Falha ao processar todas as notas novas.", "error");
        } else if (notesFailedCount > 0) {
          showToast(`${notesFailedCount} nota(s) não puderam ser processadas.`, "warning");
        }

      } catch (e) {
        console.error("[Receiver] Erro ao buscar/processar notas:", e);
        showToast((e as Error).message, "error");
        throw e; // Re-throw para que o onError do useMutation seja acionado se necessário
      } finally {
        setIsFetchingNotes(false);
      }
      return { notesProcessedCount, notesFailedCount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["private-balance", address] });
      queryClient.invalidateQueries({ queryKey: ["history", address] });
    },
    // onError já é tratado no showToast dentro do mutationFn para erros gerais
  });

  /* ------------------------------------------------------------------
   * Selectors e retorno
   * ----------------------------------------------------------------*/
  const availableSecrets = Object.entries(secretStore)
    .filter(([, n]) => !n.spent)
    .map(([id, n]) => ({ id, ...n }));

  return {
    privateBalance,
    underlyingToken,
    availableSecrets,
    shield: shield.mutateAsync,
    privateTransfer: privateTransfer.mutateAsync,
    unshield: unshield.mutateAsync,
    isShielding,
    isTransferring,
    isUnshielding,
    isLoading: shield.isPending || privateTransfer.isPending || unshield.isPending || isFetchingNotes,
    approving: approveTokens.isPending,
    fetchAndProcessEncryptedNotes: fetchAndProcessEncryptedNotes.mutateAsync,
    isFetchingPrivateNotes: isFetchingNotes,
  } as const;
}
