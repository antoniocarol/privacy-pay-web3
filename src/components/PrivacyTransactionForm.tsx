import React, { useState, useMemo } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Card, CardHeader, CardFooter } from './Card';
import { StatusBadge } from './StatusBadge';
import { useEERC20 } from '../hooks/useEERC20';
import { useAccount } from 'wagmi';

interface SecretOption {
  id: string;
  amount: string;
  label: string;
}

enum TransactionType {
  SHIELD = 'shield',
  TRANSFER = 'transfer',
  UNSHIELD = 'unshield'
}

export function PrivacyTransactionForm() {
  const [type, setType] = useState<TransactionType>(TransactionType.TRANSFER);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedSecretId, setSelectedSecretId] = useState<string>('');
  const { address } = useAccount();
  
  const {
    privateBalance,
    availableSecrets,
    shield,
    privateTransfer,
    unshield,
    isShielding,
    isTransferring,
    isUnshielding
  } = useEERC20();
  
  // Preparar opções de segredos para o menu de seleção
  const secretOptions: SecretOption[] = useMemo(() => {
    return availableSecrets.map(secret => ({
      id: secret.id,
      amount: secret.amount,
      label: `${secret.amount} PAVX (ID: ${secret.id.substring(0, 6)})`
    }));
  }, [availableSecrets]);
  
  // Manipulador de submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      switch (type) {
        case TransactionType.SHIELD:
          await shield({ amount });
          break;
        case TransactionType.TRANSFER:
          await privateTransfer({
            amount,
            recipient,
            secretId: selectedSecretId
          });
          break;
        case TransactionType.UNSHIELD:
          await unshield({
            amount,
            secretId: selectedSecretId
          });
          break;
      }
      
      // Limpar formulário após o sucesso
      setAmount('');
      setRecipient('');
    } catch (error) {
      console.error('Erro na transação:', error);
    }
  };
  
  // Verificar se o botão deve estar desativado
  const isButtonDisabled = useMemo(() => {
    if (isShielding || isTransferring || isUnshielding) return true;
    if (!amount || parseFloat(amount) <= 0) return true;
    
    if (type === TransactionType.SHIELD) {
      return false;
    }
    
    if (!selectedSecretId) return true;
    
    if (type === TransactionType.TRANSFER && !recipient) return true;
    
    return false;
  }, [amount, recipient, selectedSecretId, type, isShielding, isTransferring, isUnshielding]);
  
  // Determinar rótulo do botão com base no tipo de transação
  const getButtonLabel = () => {
    if (isShielding) return 'Protegendo tokens...';
    if (isTransferring) return 'Enviando transferência...';
    if (isUnshielding) return 'Recuperando tokens...';
    
    switch (type) {
      case TransactionType.SHIELD:
        return 'Proteger tokens (Shield)';
      case TransactionType.TRANSFER:
        return 'Enviar transferência privada';
      case TransactionType.UNSHIELD:
        return 'Recuperar tokens (Unshield)';
    }
  };
  
  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center">
            <span>Transação Privada</span>
            <StatusBadge status="privado" label="Privado" className="ml-2" />
          </div>
        }
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seletor de tipo de transação */}
        <div>
          <label className="block text-white/80 mb-2 text-sm font-medium">
            Tipo de Operação
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={type === TransactionType.SHIELD ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setType(TransactionType.SHIELD)}
              className="flex-1"
            >
              Shield
            </Button>
            <Button
              type="button"
              variant={type === TransactionType.TRANSFER ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setType(TransactionType.TRANSFER)}
              className="flex-1"
            >
              Transfer
            </Button>
            <Button
              type="button"
              variant={type === TransactionType.UNSHIELD ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setType(TransactionType.UNSHIELD)}
              className="flex-1"
            >
              Unshield
            </Button>
          </div>
        </div>
        
        {/* Campo de quantidade */}
        <Input
          label="Quantidade"
          type="number"
          placeholder="Ex: 10.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0.0001}
          step={0.0001}
          required
        />
        
        {/* Seleção de nota (para transfer e unshield) */}
        {type !== TransactionType.SHIELD && (
          <div>
            <label className="block text-white/80 mb-2 text-sm font-medium">
              Selecione uma nota privada
            </label>
            <select
              className="w-full rounded-lg border border-white/10 px-4 py-3 bg-white/5 text-white 
                      focus:ring-2 focus:ring-primary/50 focus:border-primary 
                      transition-all placeholder-white/30"
              value={selectedSecretId}
              onChange={(e) => setSelectedSecretId(e.target.value)}
              required
            >
              <option value="">Selecione uma nota</option>
              {secretOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-white/50">Notas são commitments gerados em transações Shield</p>
          </div>
        )}
        
        {/* Campo de destinatário (apenas para transfer) */}
        {type === TransactionType.TRANSFER && (
          <Input
            label="Endereço do destinatário"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        )}
        
        {/* Informações de privacidade */}
        <div className="py-2 px-3 rounded-lg bg-gradient-card-premium border border-avax-red/10">
          <div className="flex items-start">
            <div className="p-1 rounded-full bg-avax-red/10 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs text-white/70">
              {type === TransactionType.SHIELD && 
                'Shield converte tokens públicos em tokens privados protegidos por criptografia.'
              }
              {type === TransactionType.TRANSFER && 
                'Transferências privadas ocultam valores e endereços na blockchain.'
              }
              {type === TransactionType.UNSHIELD && 
                'Unshield converte tokens privados de volta para tokens públicos.'
              }
            </span>
          </div>
        </div>
        
        <CardFooter>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isShielding || isTransferring || isUnshielding}
            disabled={isButtonDisabled}
          >
            {getButtonLabel()}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 