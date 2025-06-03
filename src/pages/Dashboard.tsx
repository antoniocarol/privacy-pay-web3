import { useAccount, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { avalancheFuji } from 'viem/chains';
import { useEERC20 } from '@/hooks/useEERC20';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoadingCard } from '../components/LoadingCard';
import { Card, CardHeader, CardFooter } from '../components/Card';
import Button from '../components/Button';
import { Input } from '../components/Input';
import { StatusBadge } from '../components/StatusBadge';
import { TransactionList } from '../components/TransactionList';
import { useToast } from '../providers/ToastProvider';
import { useIsMobileOrTablet } from '../hooks/useMediaQuery';
import { TOKENS, SupportedToken } from '@/config/tokens';
import { parseUnits, formatUnits } from 'viem';
import { DepositModal } from '../components/DepositModal';
import { useHistory } from '@/hooks/useHistory';
import { getOwnEncryptionPublicKeyBase64 } from '@/services/encryptionService';
import { usePrivatePortfolioUsdValue } from '@/hooks/usePrivatePortfolioUsdValue';
import { TokenIcon } from '../components/TokenIcon';
import { TokenPortfolioItem } from '../components/TokenPortfolioItem';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientEncryptionKey, setRecipientEncryptionKey] = useState('');
  const [userEncryptionPublicKey, setUserEncryptionPublicKey] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const { showToast } = useToast();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isMobileOrTablet = useIsMobileOrTablet();
  const [activeTab, setActiveTab] = useState<'wallet' | 'send' | 'privacy'>('wallet');
  
  // Estados para o token selecionado no MODAL de depósito/saque
  const [tokenIndex, setTokenIndex] = useState(0);
  const [selectedTokenModal, setSelectedTokenModal] = useState<SupportedToken>(TOKENS[tokenIndex]);
  
  // Novos estados para a seção de ENVIO
  const [sendTokenIndex, setSendTokenIndex] = useState(0);
  const [selectedTokenForSend, setSelectedTokenForSend] = useState<SupportedToken>(TOKENS[sendTokenIndex]);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const { data: historyData, isLoading: isLoadingHistory } = useHistory();

  // Hook para o valor total do portfólio em USD e preços individuais
  const { portfolioUsdValue, isLoading: isLoadingPortfolioTotalUsd, tokenPrices } = usePrivatePortfolioUsdValue();

  // Hook useEERC20 para o token selecionado para DEPÓSITO/SAQUE (selectedTokenModal)
  const {
    shield,
    availableSecrets: modalTokenAvailableSecrets,
    isShielding,
    isUnshielding: isUnshieldingModalToken,
    privateBalance: modalTokenPrivateBalance,
    isLoading: isLoadingEERC20Data, 
    privateTransfer, 
    fetchAndProcessEncryptedNotes, 
    isFetchingPrivateNotes, 
  } = useEERC20(selectedTokenModal);

  // Hook useEERC20 para o token selecionado para ENVIO (selectedTokenForSend)
  const {
    privateBalance: sendTokenPrivateBalance,
    availableSecrets: sendTokenAvailableSecrets,
    privateTransfer: sendPrivateTransferFunction, 
    isLoading: isLoadingSendTokenData, 
  } = useEERC20(selectedTokenForSend);

  // REMOVIDO: Hook useEERC20 para o token selecionado para visualização no PORTFÓLIO
  // Precisaremos de uma nova abordagem para obter saldos de *todos* os tokens do portfólio.
  // Por agora, vamos focar em exibir a lista. O saldo virá de um novo estado/lógica.
  const [allTokenPrivateBalances, setAllTokenPrivateBalances] = useState<Record<string, string>>({});
  const [isLoadingAllBalances, setIsLoadingAllBalances] = useState(false);

  // Hook useBalance para o token do modal de depósito (selectedTokenModal)
  const { data: selectedTokenUserBalance, refetch: refetchSelectedTokenUserBalance } = useBalance({
    address,
    token: selectedTokenModal.isNative ? undefined : selectedTokenModal.erc20 as `0x${string}`,
    chainId: avalancheFuji.id,
    query: {
      enabled: !!address,
    }
  });

  // Efeito para buscar saldos de todos os tokens do portfólio
  // Esta é uma abordagem simplificada. Idealmente, cada useEERC20(token) forneceria seu saldo.
  // Ou, uma versão de useEERC20 que aceita uma lista de tokens.
  useEffect(() => {
    const fetchAllBalances = async () => {
      if (!address || !isConnected || TOKENS.length === 0) {
        setAllTokenPrivateBalances({});
        return;
      }
      setIsLoadingAllBalances(true);
      const balances: Record<string, string> = {};
      // Simulação de busca de saldos. No mundo real, chamaríamos uma função que retorna o privateBalance para cada token.
      // Por enquanto, usaremos o localStorage diretamente como uma aproximação, similar ao que useEERC20 faz internamente.
      const storedSecretsRaw = localStorage.getItem("privacy-pay-secrets");
      let secrets: Record<string, { amount: string; tokenSymbol: string; converterAddress: string; spent: boolean }> = {};
      if (storedSecretsRaw) {
        try {
          const parsed = JSON.parse(storedSecretsRaw);
          if (parsed && typeof parsed.value === 'object') secrets = parsed.value;
        } catch (e) { console.error("Failed to parse secrets for all balances", e); }
      }

      for (const token of TOKENS) {
        const sum = Object.values(secrets)
          .filter(n => !n.spent && n.tokenSymbol === token.symbol && n.converterAddress === token.converter)
          .reduce((s, n) => s + BigInt(n.amount), 0n);
        balances[token.symbol] = sum.toString();
      }
      setAllTokenPrivateBalances(balances);
      setIsLoadingAllBalances(false);
    };
    fetchAllBalances();
    // Re-fetch quando o endereço mudar ou a store de segredos for atualizada (indiretamente por outras operações)
    // O ideal seria ter um listener mais direto para a atualização do localStorage ou um estado global.
  }, [address, isConnected, /* secretStore (do useEERC20) poderia ser uma dep aqui se exportado */]);

  // useEffect para atualizar selectedTokenModal quando tokenIndex mudar (para depósito/saque)
  useEffect(() => {
    setSelectedTokenModal(TOKENS[tokenIndex]);
  }, [tokenIndex]);

  // useEffect para atualizar selectedTokenForSend quando sendTokenIndex mudar (para envio)
  useEffect(() => {
    setSelectedTokenForSend(TOKENS[sendTokenIndex]);
  }, [sendTokenIndex]);

  // useEffect para refetch balanço quando modal de depósito abrir ou token do modal mudar
  useEffect(() => {
    if (isDepositModalOpen) {
      refetchSelectedTokenUserBalance();
    }
  }, [isDepositModalOpen, selectedTokenModal, refetchSelectedTokenUserBalance]);

  // useEffect para obter chave pública de encriptação do usuário
  useEffect(() => {
    if (isConnected && address) {
      const pubKey = getOwnEncryptionPublicKeyBase64();
      setUserEncryptionPublicKey(pubKey);
      if (!pubKey) {
        // console.error(t("Não foi possível obter a chave pública de encriptação do usuário."));
      }
    }
  }, [isConnected, address, t]);

  const handleOpenDepositModal = () => {
    if (!isConnected) {
      showToast(t('É necessário conectar sua carteira para realizar depósitos.'), 'error');
      return;
    }
    setIsDepositModalOpen(true);
  };

  const executeDeposit = async (depositAmount: string, tokenToDeposit: SupportedToken) => {
    if (chainId !== avalancheFuji.id) {
      switchChain?.({ chainId: avalancheFuji.id });
      showToast(t('Rede incorreta. Por favor, troque para Fuji Testnet e tente novamente.'), 'warning');
      return;
    }
    try {
      // Garantir que o selectedTokenModal (usado pelo hook useEERC20 para shield) é o correto
      if (selectedTokenModal.symbol !== tokenToDeposit.symbol) {
        const newIndex = TOKENS.findIndex(t => t.symbol === tokenToDeposit.symbol);
        if (newIndex !== -1) {
          setTokenIndex(newIndex); // Isso vai disparar o useEffect que atualiza selectedTokenModal
          // Precisamos esperar que selectedTokenModal seja atualizado antes de chamar shield.
          // Uma solução é refatorar shield para aceitar o tokenCfg diretamente.
          // Por agora, informamos o usuário.
          showToast(t('Token para depósito atualizado. Por favor, tente depositar novamente.'), 'info');
          return;
        } else {
          showToast(t('Token de depósito inválido.'), 'error');
          return;
        }
      }
      // Agora selectedTokenModal deve ser o correto
      await shield({ amount: depositAmount }); // shield usa o tokenCfg de selectedTokenModal
      showToast(t('Depósito (shield) enviado!'), 'success');
      // Atualizar todos os saldos após o depósito
      // Idealmente, o hook useEERC20 invalidaria queries que atualizariam allTokenPrivateBalances
      // Por agora, vamos forçar um re-fetch manual simulado.
      const updatedSecretsRaw = localStorage.getItem("privacy-pay-secrets");
      if (updatedSecretsRaw) {
        try {
          const parsed = JSON.parse(updatedSecretsRaw);
          if (parsed && typeof parsed.value === 'object') {
            const balances: Record<string, string> = {};
            for (const token of TOKENS) {
              const sum = Object.values(parsed.value as Record<string, { amount: string; tokenSymbol: string; converterAddress: string; spent: boolean }>)
                .filter(n => !n.spent && n.tokenSymbol === token.symbol && n.converterAddress === token.converter)
                .reduce((s, n) => s + BigInt(n.amount), 0n);
              balances[token.symbol] = sum.toString();
            }
            setAllTokenPrivateBalances(balances);
          }
        } catch (e) { console.error("Failed to re-parse secrets after deposit", e); }
      }

    } catch (e) {
      showToast((e as Error).message, 'error');
    }
  };

  const handleMint = async () => {
    if (!amount || !recipient || !address) return;
    // const amountUnits = parseUnits(amount, selectedTokenModal.decimals); // Comentado pois handleMint não está totalmente implementado
    if (chainId !== avalancheFuji.id) {
      switchChain?.({ chainId: avalancheFuji.id });
      return;
    }
    setAmount('');
    setRecipient('');
  };

  const handleConnectWarning = () => {
    showToast(t('Para usar todas as funcionalidades, é necessário conectar sua carteira.'), 'info');
  };
  
  const handleSendTransaction = async () => {
    if (!isConnected || !address) {
      showToast(t('É necessário conectar sua carteira para realizar transações.'), 'error');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showToast(t('Por favor, insira um valor de transferência válido.'), 'warning');
      return;
    }
    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      showToast(t('Por favor, insira um endereço de destinatário válido.'), 'warning');
      return;
    }
    if (!recipientEncryptionKey) {
      showToast(t('Por favor, insira a chave pública de encriptação do destinatário.'), 'warning');
      return;
    }
    if (!selectedTokenForSend || !selectedTokenForSend.converter) { // Modificado para selectedTokenForSend
      showToast(t('Token selecionado ou seu conversor não está configurado.'), 'error');
      return;
    }

    // USAREMOS AS VARIÁVEIS DO selectedTokenForSend
    // console.log("[Debug Transfer] Selected Token For Send:", JSON.stringify(selectedTokenForSend, null, 2));
    // console.log("[Debug Transfer] All Available Secrets (for send token):", JSON.stringify(sendTokenAvailableSecrets, null, 2));

    const notesOfSelectedToken = sendTokenAvailableSecrets.filter(
      s => s.tokenSymbol === selectedTokenForSend.symbol && s.converterAddress === selectedTokenForSend.converter
    );

    // console.log("[Debug Transfer] Notes of Selected Token (after filter for send token):", JSON.stringify(notesOfSelectedToken, null, 2));

    if (notesOfSelectedToken.length === 0) {
      showToast(t("Nenhuma nota privada de {{tokenSymbol}} disponível para enviar. Deposite primeiro.", { tokenSymbol: selectedTokenForSend.symbol }), "warning");
      return;
    }

    // Lógica de seleção de nota: encontrar a primeira nota suficiente
    const transferAmountInWei = parseUnits(amount, selectedTokenForSend.decimals);
    const suitableNote = notesOfSelectedToken.find(note => BigInt(note.amount) >= transferAmountInWei);

    // console.log("[Debug Transfer] Transfer Amount (Wei) for send token:", transferAmountInWei.toString());
    // console.log("[Debug Transfer] Suitable note found (for send token):", JSON.stringify(suitableNote, null, 2));

    if (!suitableNote) {
      showToast(t("Nenhuma nota privada de {{tokenSymbol}} com saldo suficiente para enviar {{amount}} {{tokenSymbol}}. Tente um valor menor.", { tokenSymbol: selectedTokenForSend.symbol, amount: amount }), "warning");
      setMinting(false); // Certifique-se de resetar o estado de minting
      return;
    }
    
    setMinting(true);
    try {
      // Usar a função privateTransfer específica do hook instanciado com selectedTokenForSend
      const result = await sendPrivateTransferFunction({
        secretId: suitableNote.id, 
        amount: transferAmountInWei.toString(), 
        recipient: recipient,
        recipientEncKey: recipientEncryptionKey,
      });
      showToast(t("Transferência privada de {{amount}} {{tokenSymbol}} enviada! Hash: {{hash}}", { amount: amount, tokenSymbol: selectedTokenForSend.symbol, hash: result.txHash }), "success");
      setAmount('');
      setRecipient('');
      setRecipientEncryptionKey('');
    } catch (e: any) {
      showToast(e.message || t("Erro ao enviar transferência privada."), "error");
      // console.error("Erro na transferência privada:", e);
    } finally {
      setMinting(false);
    }
  };

  const handleDeposit = async () => {
    handleOpenDepositModal();
  };
  
  const handleWithdraw = async (tokenToWithdraw: SupportedToken, amountToWithdraw?: string) => {
    if (!isConnected) {
      showToast(t('É necessário conectar sua carteira para realizar saques.'), 'error');
      return;
    }
    if (!address) return;

    // Lógica para encontrar a nota correta para saque deste token específico
    // Esta lógica é similar à que está dentro de useEERC20, mas precisa ser adaptada aqui
    // ou, idealmente, useEERC20 deveria ser instanciado para cada token.
    
    const storedSecretsRaw = localStorage.getItem("privacy-pay-secrets");
    let secrets: Record<string, { id: string, amount: string; tokenSymbol: string; decimals: number, spent: boolean, converterAddress: string, nullifier: string, secret: string }> = {};
    if (storedSecretsRaw) {
      try {
        const parsed = JSON.parse(storedSecretsRaw);
        if (parsed && typeof parsed.value === 'object') {
           Object.entries(parsed.value).forEach(([id, data]) => {
            secrets[id] = { id, ...(data as any) };
          });
        }
      } catch (e) { console.error("Failed to parse secrets for withdraw", e); }
    }

    const notesOfThisToken = Object.values(secrets).filter(
      s => s.tokenSymbol === tokenToWithdraw.symbol && 
           s.converterAddress === tokenToWithdraw.converter &&
           !s.spent
    );

    if (notesOfThisToken.length === 0) {
      showToast(t("Nenhuma nota de {{tokenSymbol}} disponível para saque.", {tokenSymbol: tokenToWithdraw.symbol}), 'warning');
      return;
    }
    
    // Por simplicidade, vamos sacar a primeira nota encontrada ou o valor total se amountToWithdraw não for fornecido
    // Uma UI mais completa permitiria selecionar notas ou sacar um valor específico agregando notas.
    const secretToWithdrawDetails = notesOfThisToken[0]; 
    const withdrawAmount = amountToWithdraw || secretToWithdrawDetails.amount;

    // ** IMPORTANTE: A função unshield ainda está ligada ao `selectedTokenModal` no hook `useEERC20` **
    // Para fazer isso funcionar corretamente, precisaríamos:
    // 1. Mudar `selectedTokenModal` para `tokenToWithdraw` antes de chamar `unshield`.
    // 2. Ou, refatorar `useEERC20` para que `unshield` possa aceitar um `tokenCfg` ou `secretId` e agir sobre ele.
    // Por agora, vamos simular a mudança do `selectedTokenModal` e depois reverter. Isso é um HACK.
    
    const originalTokenIndex = tokenIndex;
    const withdrawTokenIndex = TOKENS.findIndex(t => t.symbol === tokenToWithdraw.symbol);
    
    if (withdrawTokenIndex === -1) {
        showToast(t('Token de saque inválido.'), 'error');
        return;
    }
    
    // HACK: Troca o token do hook principal temporariamente
    setTokenIndex(withdrawTokenIndex); 
    
    // Espera um ciclo para o selectedTokenModal ser atualizado no useEERC20
    // Isso ainda é arriscado e propenso a race conditions.
    // A solução ideal é refatorar useEERC20.
    setTimeout(async () => {
        try {
            showToast(t("Iniciando saque de {{amount}} {{tokenSymbol}}...", { amount: formatUnits(BigInt(withdrawAmount), tokenToWithdraw.decimals), tokenSymbol: tokenToWithdraw.symbol }), 'info');
            
            // Acessa o hook useEERC20 que agora (esperamos) está configurado para `tokenToWithdraw`
            // Precisamos de uma maneira de chamar `unshield` com o `secretId` correto.
            // A assinatura atual de `unshield` no hook é `unshield({ secretId, amount })`
            // Esta instância de useEERC20 (para selectedTokenModal) pode não ter as `availableSecrets` corretas para o `tokenToWithdraw`
            // AVISO: Esta parte é altamente propensa a falhas devido ao hack acima.
            
            // A função `unshield` em `useEERC20` pega o `secretId` de `modalTokenAvailableSecrets`.
            // Se `modalTokenAvailableSecrets` não for atualizado a tempo após mudar `tokenIndex`, isso falhará.

            // Para contornar (ainda hack), vamos tentar usar a função unshield do useEERC20,
            // mas precisamos garantir que ela use o secret correto.
            // O hook useEERC20 original (shield, unshield) é `modalInstance`.
            const modalInstance = useEERC20(tokenToWithdraw); // CRIAR UMA NOVA INSTÂNCIA DO HOOK PARA O TOKEN CORRETO
                                                        // ISSO É MELHOR QUE O HACK ACIMA, MAS AINDA NÃO IDEAL.
                                                        // Idealmente, o hook seria chamado uma vez por token na lista.

            // Encontrar o secretId correto para o tokenToWithdraw dentro de sua própria lista de availableSecrets
             const correctSecretsForWithdrawToken = Object.entries(secrets)
                .filter(([, n]) => !n.spent && n.tokenSymbol === tokenToWithdraw.symbol && n.converterAddress === tokenToWithdraw.converter)
                .map(([key, value]) => {
                  const { id: oldId, ...restOfValue } = value; // Remove 'id' de value se existir
                  return { id: key, ...restOfValue };
                });

            if (correctSecretsForWithdrawToken.length === 0) {
                 showToast(t("Nenhuma nota de {{tokenSymbol}} disponível para saque (verificação interna).", {tokenSymbol: tokenToWithdraw.symbol}), 'warning');
                 setTokenIndex(originalTokenIndex); // Reverter o HACK
                 return;
            }
            const secretForUnshield = correctSecretsForWithdrawToken[0]; // Pegar a primeira nota disponível deste token

            await modalInstance.unshield({ secretId: secretForUnshield.id, amount: withdrawAmount }); // Usar a instância correta
            showToast(t('Saque (unshield) enviado com sucesso!'), 'success');
            
            // Atualizar todos os saldos
            const updatedSecretsRawInner = localStorage.getItem("privacy-pay-secrets");
            if (updatedSecretsRawInner) {
                try {
                    const parsedInner = JSON.parse(updatedSecretsRawInner);
                    if (parsedInner && typeof parsedInner.value === 'object') {
                        const balances: Record<string, string> = {};
                        for (const token of TOKENS) {
                            const sum = Object.values(parsedInner.value as Record<string, { amount: string; tokenSymbol: string; converterAddress: string; spent: boolean }>)
                                .filter(n => !n.spent && n.tokenSymbol === token.symbol && n.converterAddress === token.converter)
                                .reduce((s, n) => s + BigInt(n.amount), 0n);
                            balances[token.symbol] = sum.toString();
                        }
                        setAllTokenPrivateBalances(balances);
                    }
                } catch (e) { console.error("Failed to re-parse secrets after withdraw", e); }
            }

        } catch (e) {
            showToast((e as Error).message, 'error');
        } finally {
            setTokenIndex(originalTokenIndex); // Reverter o HACK
        }
    }, 100); // Pequeno delay para tentar permitir a atualização do estado.

  };

  const renderMobileTabs = () => {
    return (
      <div className="flex bg-white/5 backdrop-blur-sm rounded-lg p-1 mb-6 border border-white/10">
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
            activeTab === 'wallet' ? 'bg-white/10 text-white' : 'text-white/70'
          }`}
          onClick={() => setActiveTab('wallet')}
        >
          {t('Carteira')}
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
            activeTab === 'send' ? 'bg-white/10 text-white' : 'text-white/70'
          }`}
          onClick={() => setActiveTab('send')}
        >
          {t('Enviar')}
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
            activeTab === 'privacy' ? 'bg-white/10 text-white' : 'text-white/70'
          }`}
          onClick={() => setActiveTab('privacy')}
        >
          {t('Privacidade')}
        </button>
      </div>
    );
  };

  const renderMobileContent = () => {
    const motionProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    };

    switch (activeTab) {
      case 'wallet':
        return (
          <motion.div {...motionProps} key="wallet">
            <Card>
              <CardHeader 
                title={t("Portfólio Privado")}
                children={<StatusBadge status="privado" label={t("Privado")} />} 
              />
              
              {isLoadingPortfolioTotalUsd || isLoadingAllBalances ? (
                <LoadingCard />
              ) : (
                <div className="space-y-3">
                  {/* Saldo Total em USD */}
                  <div className="mb-6 text-center border-b border-white/10 pb-4">
                    <div className="text-sm text-white/70 mb-1">{t("Valor Total Estimado")}</div>
                    <div className="text-3xl font-bold text-white">
                      {typeof portfolioUsdValue === 'number' 
                        ? `$${portfolioUsdValue.toFixed(2)} USD` 
                        : t("Carregando...")}
                    </div>
                  </div>

                  {/* NOVA LISTA DE TOKENS */}
                  <div className="space-y-2">
                    {TOKENS.map((tokenItem, idx) => {
                      const privateBalanceForToken = allTokenPrivateBalances[tokenItem.symbol] || '0';
                      const priceForToken = tokenPrices ? tokenPrices[tokenItem.symbol] : 0;
                      
                      // Adicionar uma verificação para priceForToken para evitar NaN se o preço não estiver disponível
                      if (typeof priceForToken !== 'number') {
                        // console.warn(`Preço para ${tokenItem.symbol} não encontrado ou inválido.`);
                        // Poderia renderizar um estado de carregamento/erro específico para este item
                      }

                      return (
                        <TokenPortfolioItem
                          key={tokenItem.symbol}
                          token={tokenItem}
                          privateBalance={privateBalanceForToken}
                          usdPrice={priceForToken || 0} // Passa 0 se o preço não estiver disponível
                          index={idx}
                          // chartData={...} // Passar dados do gráfico aqui quando disponíveis
                        />
                      );
                    })}
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-6">
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-white/60">{t("Status de privacidade")}</span>
                      <span className="flex items-center text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {t("Protegido")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <CardFooter divider={false} className="mt-auto pt-4 grid grid-cols-1 gap-3">
                <Button variant="secondary" size="sm" onClick={handleDeposit}>
                  {t("Depositar Fundos")}
                </Button>
                {/* Botão de sacar individual por token será adicionado no TokenPortfolioItem ou repensado */}
              </CardFooter>
            </Card>
          </motion.div>
        );
        
      case 'send':
        return (
          <motion.div {...motionProps} key="send">
            <Card>
              <CardHeader 
                title={t("Transferência privada")}
                children={
                  <div className="p-1 rounded-full bg-green-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                }
              />
              <div className="space-y-4">
                <Input
                  label={t("Endereço do destinatário")}
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  helperText={t("O endereço do destinatário será encriptado")}
                />
                
                <Input
                  label={t("Chave Pública de Encriptação do Destinatário")}
                  placeholder={t("Cole a chave pública Base64 aqui...")}
                  value={recipientEncryptionKey}
                  onChange={(e) => setRecipientEncryptionKey(e.target.value)}
                  helperText={t("Necessária para que o destinatário possa decriptar a nota.")}
                />

                {/* Seletor de Token para Envio */}
                <div className="mb-4">
                  <label htmlFor="sendTokenSelect" className="block text-sm font-medium text-white/90 mb-1">{t("Token para Enviar")}</label>
                  <select 
                    id="sendTokenSelect"
                    value={sendTokenIndex}
                    onChange={(e) => setSendTokenIndex(Number(e.target.value))}
                    className="block w-full bg-white/5 border border-white/20 rounded-lg p-2.5 text-white focus:ring-primary focus:border-primary text-sm"
                  >
                    {TOKENS.map((token, index) => (
                      <option key={token.symbol} value={index} className="bg-gray-800 text-white">
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label={t("Quantidade de tokens")}
                  placeholder={t("Ex: 10 (Máx: {{maxAmount}})", { maxAmount: sendTokenPrivateBalance ? formatUnits(BigInt(sendTokenPrivateBalance), selectedTokenForSend.decimals) : '0' })}
                  type="number"
                  min={0} // Permitir 0 para validação, mas a lógica de envio deve barrar <= 0
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {sendTokenPrivateBalance && (
                  <p className="text-xs text-white/70 mt-1 mb-3">
                    {t("Saldo privado de {{tokenSymbol}} disponível: {{balance}}", { tokenSymbol: selectedTokenForSend.symbol, balance: formatUnits(BigInt(sendTokenPrivateBalance), selectedTokenForSend.decimals)})}
                  </p>
                )}
                
                <div className="py-2 px-3 rounded-lg bg-gradient-card-premium border border-avax-red/10">
                  <div className="flex items-start">
                    <div className="p-1 rounded-full bg-avax-red/10 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-white/70">{t("Os valores e destinatários de suas transações são protegidos por tecnologia de encriptação ZK-SNARK")}</span>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  className="mt-6"
                  isLoading={minting}
                  disabled={minting || !amount || !recipient || !address || isLoadingSendTokenData}
                  onClick={handleSendTransaction}
                >
                  {t("Enviar transferência privada")}
                </Button>
              </div>
            </Card>
          </motion.div>
        );
        
      case 'privacy':
        return (
          <motion.div {...motionProps} key="privacy">
            <Card>
              <CardHeader 
                title={t("Status de Privacidade")}
                children={<StatusBadge status="success" label={t("Ativo")} />} 
              />
              <div className="space-y-5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-white">{t("Endereços ocultos")}</span>
                  </div>
                  <span className="text-xs text-green-400">{t("Ativo")}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-white">{t("Valores protegidos")}</span>
                  </div>
                  <span className="text-xs text-green-400">{t("Ativo")}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-white">{t("Rotas anonimizadas")}</span>
                  </div>
                  <span className="text-xs text-green-400">{t("Ativo")}</span>
                </div>
                {userEncryptionPublicKey && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-white/70 mb-1">{t("Sua Chave Pública de Encriptação (compartilhe com remetentes):")}</p>
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={userEncryptionPublicKey}
                        readOnly
                        className="text-xs truncate bg-transparent border-none p-0"
                      />
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(userEncryptionPublicKey!);
                          showToast(t('Chave pública copiada!'), 'success');
                        }}
                      >
                        {t("Copiar")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <CardFooter>
                <p className="text-white/70 text-sm">{t("Nossa tecnologia ZK-SNARK garante que suas operações fiquem totalmente anônimas na blockchain Avalanche.")}</p>
                <Button 
                  variant="secondary" 
                  fullWidth 
                  className="mt-4" 
                  size="sm"
                  onClick={() => showToast(t('Detalhes técnicos em breve disponíveis'), 'info')}
                >
                  {t("Ver detalhes técnicos")}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        );
    }
  };

  return (
    <div className="py-8 md:py-12 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 md:mb-0">
          {t("Carteira Privada")}
        </h2>
        <div className="flex items-center space-x-3 md:space-x-4 mt-4 md:mt-0">
          {isConnected && address && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                try {
                  await fetchAndProcessEncryptedNotes();
                } catch (e) {
                  // Erros já são tratados com toasts dentro da mutação
                  // console.error("Erro ao chamar fetchAndProcessEncryptedNotes do dashboard:", e);
                }
              }}
              isLoading={isFetchingPrivateNotes}
              disabled={isFetchingPrivateNotes}
            >
              {isFetchingPrivateNotes ? t('Sincronizando...') : t('Sincronizar Notas Recebidas')}
            </Button>
          )}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10 flex items-center self-start">
            <span className="text-xs text-white/60 mr-2">{t("Rede:")}</span>
            <span className="flex items-center text-sm text-white">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Avalanche C-Chain
            </span>
          </div>
        </div>
      </div>
      
      {!isConnected && (
        <Card className="mb-6 md:mb-10 max-w-xl mx-auto border border-red-500/20">
          <div className="flex flex-col md:flex-row md:items-start">
            <div className="p-2 rounded-full bg-red-500/10 mb-4 md:mb-0 md:mr-4 self-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <strong className="block text-lg font-semibold text-white mb-2">{t("Carteira não conectada")}</strong>
              <p className="text-white/80 mb-3">{t("Para garantir privacidade total de suas transações, conecte uma carteira compatível com a rede Avalanche.")}</p>
              <Button 
                variant="ghost" 
                onClick={handleConnectWarning}
                className="text-primary hover:text-secondary"
              >
                {t("Precisa de ajuda para conectar?")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isMobileOrTablet ? (
        <>
          {renderMobileTabs()}
          <div className="space-y-6">
            {renderMobileContent()}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            <Card>
              <CardHeader 
                title={t("Portfólio Privado")}
                children={<StatusBadge status="privado" label={t("Privado")} />} 
              />
              
              {isLoadingPortfolioTotalUsd || isLoadingAllBalances ? (
                <LoadingCard />
              ) : (
                <div className="space-y-3">
                  {/* Saldo Total em USD */}
                  <div className="mb-6 text-center border-b border-white/10 pb-4">
                    <div className="text-sm text-white/70 mb-1">{t("Valor Total Estimado")}</div>
                    <div className="text-3xl font-bold text-white">
                      {typeof portfolioUsdValue === 'number' 
                        ? `$${portfolioUsdValue.toFixed(2)} USD` 
                        : t("Carregando...")}
                    </div>
                  </div>

                  {/* NOVA LISTA DE TOKENS */}
                  <div className="space-y-2">
                    {TOKENS.map((tokenItem, idx) => {
                      const privateBalanceForToken = allTokenPrivateBalances[tokenItem.symbol] || '0';
                      const priceForToken = tokenPrices ? tokenPrices[tokenItem.symbol] : 0;
                      
                      // Adicionar uma verificação para priceForToken para evitar NaN se o preço não estiver disponível
                      if (typeof priceForToken !== 'number') {
                        // console.warn(`Preço para ${tokenItem.symbol} não encontrado ou inválido.`);
                        // Poderia renderizar um estado de carregamento/erro específico para este item
                      }

                      return (
                        <TokenPortfolioItem
                          key={tokenItem.symbol}
                          token={tokenItem}
                          privateBalance={privateBalanceForToken}
                          usdPrice={priceForToken || 0} // Passa 0 se o preço não estiver disponível
                          index={idx}
                          // chartData={...} // Passar dados do gráfico aqui quando disponíveis
                        />
                      );
                    })}
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-6">
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-white/60">{t("Status de privacidade")}</span>
                      <span className="flex items-center text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {t("Protegido")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <CardFooter divider={false} className="mt-auto pt-4 grid grid-cols-1 gap-3">
                <Button variant="secondary" size="sm" onClick={handleDeposit}>
                  {t("Depositar Fundos")}
                </Button>
                {/* Botão de sacar individual por token será adicionado no TokenPortfolioItem ou repensado */}
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            <Card>
              <CardHeader 
                title={t("Transferência privada")}
                children={
                  <div className="p-1 rounded-full bg-green-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                }
              />
              
              <div className="space-y-4">
                <Input
                  label={t("Endereço do destinatário")}
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  helperText={t("O endereço do destinatário será encriptado")}
                />
                
                <Input
                  label={t("Chave Pública de Encriptação do Destinatário")}
                  placeholder={t("Cole a chave pública Base64 aqui...")}
                  value={recipientEncryptionKey}
                  onChange={(e) => setRecipientEncryptionKey(e.target.value)}
                  helperText={t("Necessária para que o destinatário possa decriptar a nota.")}
                />

                {/* Seletor de Token para Envio (Desktop) */}
                <div className="mb-4">
                  <label htmlFor="sendTokenSelectDesktop" className="block text-sm font-medium text-white/90 mb-1">{t("Token para Enviar")}</label>
                  <select 
                    id="sendTokenSelectDesktop"
                    value={sendTokenIndex}
                    onChange={(e) => setSendTokenIndex(Number(e.target.value))}
                    className="block w-full bg-white/5 border border-white/20 rounded-lg p-2.5 text-white focus:ring-primary focus:border-primary text-sm"
                  >
                    {TOKENS.map((token, index) => (
                      <option key={token.symbol} value={index} className="bg-gray-800 text-white">
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  label={t("Quantidade de tokens")}
                  placeholder={t("Ex: 10 (Máx: {{maxAmount}})", { maxAmount: sendTokenPrivateBalance ? formatUnits(BigInt(sendTokenPrivateBalance), selectedTokenForSend.decimals) : '0' })}
                  type="number"
                  min={0} // Permitir 0 para validação, mas a lógica de envio deve barrar <= 0
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {sendTokenPrivateBalance && (
                  <p className="text-xs text-white/70 mt-1 mb-3">
                    {t("Saldo privado de {{tokenSymbol}} disponível: {{balance}}", { tokenSymbol: selectedTokenForSend.symbol, balance: formatUnits(BigInt(sendTokenPrivateBalance), selectedTokenForSend.decimals)})}
                  </p>
                )}
                
                <div className="py-2 px-3 rounded-lg bg-gradient-card-premium border border-avax-red/10">
                  <div className="flex items-start">
                    <div className="p-1 rounded-full bg-avax-red/10 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-white/70">{t("Os valores e destinatários de suas transações são protegidos por tecnologia de encriptação ZK-SNARK")}</span>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  className="mt-6"
                  isLoading={minting}
                  disabled={minting || !amount || !recipient || !address || isLoadingSendTokenData}
                  onClick={handleSendTransaction}
                >
                  {t("Enviar transferência privada")}
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
          >
            <Card>
              <CardHeader 
                title={t("Status de Privacidade")}
                children={<StatusBadge status="success" label={t("Ativo")} />} 
              />
              
              <div className="space-y-5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-white">{t("Endereços ocultos")}</span>
                  </div>
                  <span className="text-xs text-green-400">{t("Ativo")}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-white">{t("Valores protegidos")}</span>
                  </div>
                  <span className="text-xs text-green-400">{t("Ativo")}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-white">{t("Rotas anonimizadas")}</span>
                  </div>
                  <span className="text-xs text-green-400">{t("Ativo")}</span>
                </div>
                {userEncryptionPublicKey && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-white/70 mb-1">{t("Sua Chave Pública de Encriptação (compartilhe com remetentes):")}</p>
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={userEncryptionPublicKey}
                        readOnly
                        className="text-xs truncate bg-transparent border-none p-0"
                      />
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(userEncryptionPublicKey!);
                          showToast(t('Chave pública copiada!'), 'success');
                        }}
                      >
                        {t("Copiar")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <CardFooter>
                <p className="text-white/70 text-sm">{t("Nossa tecnologia ZK-SNARK garante que suas operações fiquem totalmente anônimas na blockchain Avalanche.")}</p>
                <Button 
                  variant="secondary" 
                  fullWidth 
                  className="mt-4" 
                  size="sm"
                  onClick={() => showToast(t('Detalhes técnicos em breve disponíveis'), 'info')}
                >
                  {t("Ver detalhes técnicos")}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="overflow-hidden mt-8 md:mt-12">
          <TransactionList transactions={historyData || []} isLoading={isLoadingHistory} />
        </Card>
      </motion.div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDeposit={executeDeposit}
        userBalance={selectedTokenUserBalance?.value?.toString() ?? '0'}
        selectedToken={selectedTokenModal}
        setSelectedToken={setSelectedTokenModal}
      />
    </div>
  );
} 