import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContract } from '../services/contract';
import { cryptoService } from '../services/crypto';
import { useToast } from '../providers/ToastProvider';
import { useLocalStorage } from './useLocalStorage';

// Configuração
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Tipos para o armazenamento local de dados privados
interface SecretData {
  nullifier: string;
  secret: string;
  amount: string;
  commitment: string;
  timestamp: number;
  spent: boolean;
}

interface ShieldParams {
  amount: string;
}

interface TransferParams {
  amount: string;
  recipient: string;
  secretId: string;
}

interface UnshieldParams {
  amount: string;
  secretId: string;
}

/**
 * Hook personalizado para operações eERC20 (shield, transfer, unshield)
 * Gerencia estados locais de segredos e operações com o contrato eERC20
 */
export function useEERC20() {
  const { address } = useAccount();
  const { getContract } = useContract();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  // Armazenamento local de commitments e segredos (em produção deveria usar criptografia mais forte)
  const [secretStore, setSecretStore] = useLocalStorage<Record<string, SecretData>>(
    'privacy-pay-secrets', 
    {}
  );
  
  // Estados locais para transações em andamento
  const [isShielding, setIsShielding] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isUnshielding, setIsUnshielding] = useState(false);
  
  // Busca o saldo total privado (secrets não gastos)
  const { data: privateBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['private-balance', address],
    queryFn: () => {
      if (!address || !secretStore) return '0';
      
      // Calcula o saldo somando todos os secrets não gastos
      const availableSecrets = Object.values(secretStore)
        .filter(secret => !secret.spent && secret.timestamp > Date.now() - (90 * 24 * 60 * 60 * 1000)); // 90 dias
      
      // Soma os valores
      const total = availableSecrets.reduce(
        (sum, secret) => sum + parseFloat(secret.amount), 
        0
      );
        
      return total.toString();
    },
    enabled: !!address,
  });

  // Busca o token ERC20 subjacente
  const { data: underlyingToken } = useQuery({
    queryKey: ['underlying-token', address],
    queryFn: async () => {
      if (!address) return null;
      const contract = getContract();
      
      try {
        // Obtém o endereço do token subjacente
        const underlyingAddress = await contract.read.underlying();
        return underlyingAddress;
      } catch (error) {
        console.error('Erro ao buscar token subjacente:', error);
        return null;
      }
    },
    enabled: !!address,
  });
  
  // Retorna todos os secrets disponíveis (não gastos)
  const getAvailableSecrets = useCallback(() => {
    if (!secretStore) return [];
    
    return Object.entries(secretStore)
      .filter(([_, data]) => !data.spent)
      .map(([id, data]) => ({
        id,
        ...data
      }));
  }, [secretStore]);
  
  /**
   * Exporta todos os segredos em formato criptografado
   * @returns String criptografada contendo todos os segredos
   */
  const exportSecrets = useCallback(() => {
    if (!address) throw new Error('Wallet não conectada');
    if (Object.keys(secretStore).length === 0) throw new Error('Nenhuma nota para exportar');
    
    try {
      // Criptografa os dados usando o endereço da carteira como chave
      const exportData = cryptoService.encrypt(
        JSON.stringify(secretStore),
        address
      );
      
      // Adiciona prefixo para identificar dados do PrivacyPay
      return `PRIVACYPAY:${exportData}`;
    } catch (error) {
      console.error('Erro ao exportar segredos:', error);
      throw new Error('Falha ao exportar notas privadas');
    }
  }, [address, secretStore]);
  
  /**
   * Importa segredos de uma string criptografada
   * @param importData String criptografada contendo segredos
   */
  const importSecrets = useCallback((importData: string) => {
    if (!address) throw new Error('Wallet não conectada');
    
    try {
      // Verifica o prefixo
      if (!importData.startsWith('PRIVACYPAY:')) {
        throw new Error('Formato de dados inválido');
      }
      
      // Remove o prefixo
      const encryptedData = importData.replace('PRIVACYPAY:', '');
      
      // Descriptografa os dados
      const decryptedData = cryptoService.decrypt(encryptedData, address);
      if (!decryptedData) throw new Error('Falha ao descriptografar dados');
      
      // Converte para objeto
      const importedSecrets = JSON.parse(decryptedData);
      
      // Atualiza o armazenamento local
      setSecretStore(importedSecrets);
      
      // Atualiza o saldo
      queryClient.invalidateQueries({ queryKey: ['private-balance', address] });
      
      return true;
    } catch (error) {
      console.error('Erro ao importar segredos:', error);
      throw new Error('Falha ao importar notas privadas');
    }
  }, [address, queryClient, setSecretStore]);
  
  /**
   * Aprovação de tokens para o contrato converter (requisito para shield)
   */
  const approveTokens = useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!address) throw new Error('Wallet não conectada');
      
      try {
        const contract = getContract();
        
        // Approve tokens para o contrato
        const tx = await contract.write.approve([
          CONTRACT_ADDRESS,  // spender (o próprio contrato)
          amount            // quantidade
        ]);
        
        return tx.hash;
      } catch (error) {
        console.error('Erro na aprovação:', error);
        throw new Error(`Falha ao aprovar tokens: ${(error as Error).message}`);
      }
    }
  });
  
  /**
   * Operação shield - converte tokens públicos em privados
   */
  const shield = useMutation({
    mutationFn: async ({ amount }: ShieldParams) => {
      if (!address) throw new Error('Wallet não conectada');
      setIsShielding(true);
      
      try {
        const contract = getContract();
        
        // Primeiro, aprova os tokens
        showToast('Aprovando tokens para o contrato...', 'info');
        await approveTokens.mutateAsync({ amount });
        
        // Gera um commitment para o shield
        const { commitment, nullifier, secret } = 
          cryptoService.generateShieldCommitment(amount, address);
        
        // Enviar transação shield para o contrato
        showToast('Enviando transação shield...', 'info');
        const tx = await contract.write.shield([amount, commitment]);
        
        // Salva os segredos localmente para uso futuro
        const secretId = `${nullifier.substring(0, 8)}-${Date.now()}`;
        setSecretStore(prev => ({
          ...prev,
          [secretId]: {
            nullifier,
            secret,
            amount,
            commitment,
            timestamp: Date.now(),
            spent: false
          }
        }));
        
        return {
          txHash: tx.hash,
          secretId
        };
      } finally {
        setIsShielding(false);
      }
    },
    onSuccess: (data) => {
      showToast(`Tokens protegidos com sucesso! ID da nota: ${data.secretId}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['private-balance', address] });
    },
    onError: (error) => {
      showToast(`Erro ao proteger tokens: ${(error as Error).message}`, 'error');
    }
  });
  
  /**
   * Transferência privada entre carteiras
   */
  const privateTransfer = useMutation({
    mutationFn: async ({ amount, recipient, secretId }: TransferParams) => {
      if (!address) throw new Error('Wallet não conectada');
      if (!secretStore[secretId]) throw new Error('Nota privada não encontrada');
      
      setIsTransferring(true);
      
      try {
        const contract = getContract();
        const secretData = secretStore[secretId];
        
        // Verifica se o secret já foi gasto
        if (secretData.spent) {
          throw new Error('Esta nota já foi gasta');
        }
        
        // Verifica se o valor é suficiente
        if (parseFloat(secretData.amount) < parseFloat(amount)) {
          throw new Error('Saldo insuficiente na nota selecionada');
        }
        
        // Cria os dados para a transferência privada
        const { nullifier, secret } = secretData;
        const { newCommitment, transferData } = cryptoService.createPrivateTransferData(
          nullifier,
          secret,
          amount,
          recipient
        );
        
        showToast('Enviando transação privada...', 'info');
        // Envia a transação para o relayer (simulado para MVP)
        // Em produção, isso enviaria para um serviço Relayer externo
        const tx = await contract.write.privateTransfer([nullifier, newCommitment]);
        
        // Marca o secret atual como gasto
        setSecretStore(prev => ({
          ...prev,
          [secretId]: {
            ...prev[secretId],
            spent: true
          }
        }));
        
        // Se houver troco, cria um novo secret para o remetente
        const change = parseFloat(secretData.amount) - parseFloat(amount);
        if (change > 0) {
          const changeSecretId = `change-${Date.now()}`;
          const changeCommitment = cryptoService.generateShieldCommitment(
            change.toString(), 
            address
          );
          
          setSecretStore(prev => ({
            ...prev,
            [changeSecretId]: {
              nullifier: changeCommitment.nullifier,
              secret: changeCommitment.secret,
              amount: change.toString(),
              commitment: changeCommitment.commitment,
              timestamp: Date.now(),
              spent: false
            }
          }));
        }
        
        return {
          txHash: tx.hash
        };
      } finally {
        setIsTransferring(false);
      }
    },
    onSuccess: () => {
      showToast('Transferência privada realizada com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['private-balance', address] });
    },
    onError: (error) => {
      showToast(`Erro na transferência: ${(error as Error).message}`, 'error');
    }
  });
  
  /**
   * Operação unshield - converte tokens privados de volta para públicos
   */
  const unshield = useMutation({
    mutationFn: async ({ amount, secretId }: UnshieldParams) => {
      if (!address) throw new Error('Wallet não conectada');
      if (!secretStore[secretId]) throw new Error('Nota privada não encontrada');
      
      setIsUnshielding(true);
      
      try {
        const contract = getContract();
        const secretData = secretStore[secretId];
        
        // Verifica se o secret já foi gasto
        if (secretData.spent) {
          throw new Error('Esta nota já foi gasta');
        }
        
        // Verifica se o valor é suficiente
        if (parseFloat(secretData.amount) < parseFloat(amount)) {
          throw new Error('Saldo insuficiente na nota selecionada');
        }
        
        // Envia a transação unshield
        const { nullifier } = secretData;
        showToast('Enviando transação unshield...', 'info');
        const tx = await contract.write.unshield([nullifier, address, amount]);
        
        // Marca o secret como gasto
        setSecretStore(prev => ({
          ...prev,
          [secretId]: {
            ...prev[secretId],
            spent: true
          }
        }));
        
        // Se houver troco, cria um novo secret para o usuário
        const change = parseFloat(secretData.amount) - parseFloat(amount);
        if (change > 0) {
          const changeSecretId = `change-${Date.now()}`;
          const changeCommitment = cryptoService.generateShieldCommitment(
            change.toString(), 
            address
          );
          
          setSecretStore(prev => ({
            ...prev,
            [changeSecretId]: {
              nullifier: changeCommitment.nullifier,
              secret: changeCommitment.secret,
              amount: change.toString(),
              commitment: changeCommitment.commitment,
              timestamp: Date.now(),
              spent: false
            }
          }));
        }
        
        return {
          txHash: tx.hash
        };
      } finally {
        setIsUnshielding(false);
      }
    },
    onSuccess: () => {
      showToast('Tokens recuperados com sucesso para sua carteira pública!', 'success');
      queryClient.invalidateQueries({ queryKey: ['private-balance', address] });
    },
    onError: (error) => {
      showToast(`Erro ao recuperar tokens: ${(error as Error).message}`, 'error');
    }
  });
  
  // Exporta as funcionalidades do hook
  return {
    privateBalance,
    underlyingToken,
    availableSecrets: getAvailableSecrets(),
    shield: shield.mutateAsync,
    privateTransfer: privateTransfer.mutateAsync,
    unshield: unshield.mutateAsync,
    exportSecrets,
    importSecrets,
    isShielding,
    isTransferring,
    isUnshielding,
    isLoading: shield.isPending || privateTransfer.isPending || unshield.isPending,
    approving: approveTokens.isPending,
    refetchBalance
  };
} 