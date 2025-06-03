import React, { useState, useEffect } from 'react';
import { TOKENS, SupportedToken } from '@/config/tokens';
import Button from './Button';
import { Input } from './Input';
import { parseUnits, formatUnits } from 'viem';
import { useToast } from '@/providers/ToastProvider';
import { useTranslation } from 'react-i18next';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: string, token: SupportedToken) => Promise<void>;
  userBalance: string; // Saldo do token selecionado na carteira do usuário
  selectedToken: SupportedToken;
  setSelectedToken: (token: SupportedToken) => void;
}

export function DepositModal({
  isOpen,
  onClose,
  onDeposit,
  userBalance,
  selectedToken,
  setSelectedToken,
}: DepositModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [isDepositing, setIsDepositing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setPercentage(0);
    }
  }, [isOpen]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (parseFloat(userBalance) > 0) {
      const newPercentage = (parseFloat(value) / parseFloat(formatUnits(BigInt(userBalance), selectedToken.decimals))) * 100;
      setPercentage(Math.min(Math.max(newPercentage, 0), 100));
    } else {
      setPercentage(0);
    }
  };

  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    if (parseFloat(userBalance) > 0) {
      const newAmount = (parseFloat(formatUnits(BigInt(userBalance), selectedToken.decimals)) * newPercentage) / 100;
      setAmount(newAmount.toFixed(selectedToken.decimals));
    } else {
      setAmount('0');
    }
  };

  const handleMax = () => {
    if (userBalance) {
      const fullBalance = formatUnits(BigInt(userBalance), selectedToken.decimals);
      setAmount(fullBalance);
      setPercentage(100);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast(t('Por favor, insira uma quantidade válida para depositar.'), 'warning');
      return;
    }
    setIsDepositing(true);
    try {
      const amountUnits = parseUnits(amount, selectedToken.decimals);
      await onDeposit(amountUnits.toString(), selectedToken);
    } catch (error) {
      showToast(t("Erro ao depositar: {{errorMessage}}", {errorMessage: (error as Error).message}), 'error');
    } finally {
      setIsDepositing(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-darkblue p-6 rounded-lg shadow-xl w-full max-w-md border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">{t("Depositar Tokens")}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">{t("Selecionar Token")}</label>
            <select
              value={selectedToken.symbol}
              onChange={(e) => {
                const token = TOKENS.find(t => t.symbol === e.target.value);
                if (token) setSelectedToken(token);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white focus:ring-primary focus:border-primary"
            >
              {TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol} className="bg-darkblue text-white">
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={t("Quantidade de {{tokenSymbol}}", { tokenSymbol: selectedToken.symbol })}
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={`0.00 ${selectedToken.symbol}`}
            rightIcon={
              <button
                onClick={handleMax}
                className="text-xs bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30"
              >
                {t("MAX")}
              </button>
            }
          />

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">{t("Porcentagem do Saldo")}</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => handlePercentageChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                disabled={!userBalance || parseFloat(userBalance) === 0}
              />
              <span className="text-white/80 text-sm w-12 text-right">{percentage.toFixed(0)}%</span>
            </div>
             {userBalance && (
              <p className="text-xs text-white/50 mt-1">
                {t("Saldo disponível: {{balance}} {{tokenSymbol}}", { balance: formatUnits(BigInt(userBalance), selectedToken.decimals), tokenSymbol: selectedToken.symbol})}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose} disabled={isDepositing}>
            {t("Cancelar")}
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isDepositing} disabled={isDepositing || !parseFloat(amount) || parseFloat(amount) <= 0}>
            {t("Depositar")}
          </Button>
        </div>
      </div>
    </div>
  );
} 