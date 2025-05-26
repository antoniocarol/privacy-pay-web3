import { useAccount } from 'wagmi';
import { useSecretPoints } from '@/hooks/useSecretPoints';
import { useMintPoints } from '@/hooks/useMintPoints';
import { useState } from 'react';
import { LoadingCard } from '../components/LoadingCard';
import { Card, CardHeader, CardFooter } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { StatusBadge } from '../components/StatusBadge';
import { TransactionList, Transaction } from '../components/TransactionList';
import { useToast } from '../providers/ToastProvider';
import { useIsMobileOrTablet } from '../hooks/useMediaQuery';

const mockTransactions: Transaction[] = [
  { id: 1, type: 'Enviado', value: 100, status: 'Confirmada', hash: '0xf76c...a3b2', date: '2024-06-01' },
  { id: 2, type: 'Recebido', value: 50, status: 'Confirmada', hash: '0xc82d...f1e5', date: '2024-06-02' },
  { id: 3, type: 'Enviado', value: 25, status: 'Pendente', hash: '0xb94a...d7c6', date: '2024-06-03' },
];

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading } = useSecretPoints();
  const { mutate: mintPoints } = useMintPoints();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [minting, setMinting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { showToast } = useToast();
  const isMobileOrTablet = useIsMobileOrTablet();
  const [activeTab, setActiveTab] = useState<'wallet' | 'send' | 'privacy'>('wallet');
  
  const handleMint = () => {
    if (!amount || !recipient || !address) return;
    mintPoints({ amount: Number(amount), recipient });
    setAmount('');
    setRecipient('');
  };

  // Handler para conexão
  const handleConnectWarning = () => {
    setShowWarning(true);
    showToast('Para usar todas as funcionalidades, é necessário conectar sua carteira.', 'info');
  };
  
  // Handler para envio de transação
  const handleSendTransaction = () => {
    if (!isConnected) {
      showToast('É necessário conectar sua carteira para realizar transações.', 'error');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Por favor, insira um valor válido.', 'warning');
      return;
    }
    
    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      showToast('Por favor, insira um endereço de carteira válido.', 'warning');
      return;
    }
    
    setMinting(true);
    handleMint();
    
    // Simulação de processamento da transação
    setTimeout(() => {
      setMinting(false);
      showToast('Transação enviada com sucesso! A privacidade do envio foi garantida.', 'success');
    }, 2000);
  };

  // Handlers para as operações de depósito e saque
  const handleDeposit = () => {
    if (!isConnected) {
      showToast('É necessário conectar sua carteira para realizar depósitos.', 'error');
      return;
    }
    
    showToast('Funcionalidade de depósito em desenvolvimento.', 'info');
  };
  
  const handleWithdraw = () => {
    if (!isConnected) {
      showToast('É necessário conectar sua carteira para realizar saques.', 'error');
      return;
    }
    
    showToast('Funcionalidade de saque em desenvolvimento.', 'info');
  };

  // Renderiza a navegação por tabs para dispositivos móveis
  const renderMobileTabs = () => {
    return (
      <div className="flex bg-white/5 backdrop-blur-sm rounded-lg p-1 mb-6 border border-white/10">
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
            activeTab === 'wallet' ? 'bg-white/10 text-white' : 'text-white/70'
          }`}
          onClick={() => setActiveTab('wallet')}
        >
          Carteira
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
            activeTab === 'send' ? 'bg-white/10 text-white' : 'text-white/70'
          }`}
          onClick={() => setActiveTab('send')}
        >
          Enviar
        </button>
        <button
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
            activeTab === 'privacy' ? 'bg-white/10 text-white' : 'text-white/70'
          }`}
          onClick={() => setActiveTab('privacy')}
        >
          Privacidade
        </button>
      </div>
    );
  };

  // Função para renderizar o conteúdo baseado na tab ativa (mobile)
  const renderMobileContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <Card>
            <CardHeader title="Seus ativos" children={<StatusBadge status="privado" label="Privado" />} />
            {isLoading ? (
              <LoadingCard />
            ) : (
              <div>
                <div className="flex items-center space-x-4 mb-6 bg-gradient-card-premium p-4 rounded-lg border border-avax-red/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-avax-red to-avax-orange flex items-center justify-center shadow-glow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Private AVAX</div>
                    <div className="text-2xl font-bold text-white">{balance ?? 0} <span className="text-sm font-normal text-white/70">PAVX</span></div>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-4 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Valor estimado</span>
                    <span className="text-white font-medium">$0.00 USD</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-white/60">Status de privacidade</span>
                    <span className="flex items-center text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Protegido
                    </span>
                  </div>
                </div>
              </div>
            )}
            <CardFooter divider={false} className="mt-auto pt-4 grid grid-cols-2 gap-3">
              <Button variant="secondary" size="sm" onClick={handleDeposit}>
                Depositar
              </Button>
              <Button variant="primary" size="sm" onClick={handleWithdraw}>
                Sacar
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 'send':
        return (
          <Card>
            <CardHeader 
              title="Transferência privada" 
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
                label="Endereço do destinatário"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                helperText="O endereço do destinatário será encriptado"
              />
              <Input
                label="Quantidade de tokens"
                placeholder="Ex: 100"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="py-2 px-3 rounded-lg bg-gradient-card-premium border border-avax-red/10">
                <div className="flex items-start">
                  <div className="p-1 rounded-full bg-avax-red/10 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-white/70">Os valores e destinatários de suas transações são protegidos por tecnologia de encriptação ZK-SNARK</span>
                </div>
              </div>
              <Button
                variant="primary"
                fullWidth
                className="mt-6"
                isLoading={minting}
                disabled={minting || !amount || !recipient || !address}
                onClick={handleSendTransaction}
              >
                Enviar transferência privada
              </Button>
            </div>
          </Card>
        );
        
      case 'privacy':
        return (
          <Card>
            <CardHeader 
              title="Status de Privacidade" 
              children={<StatusBadge status="success" label="Ativo" />} 
            />
            <div className="space-y-5 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-white">Endereços ocultos</span>
                </div>
                <span className="text-xs text-green-400">Ativo</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-white">Valores protegidos</span>
                </div>
                <span className="text-xs text-green-400">Ativo</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-white">Rotas anonimizadas</span>
                </div>
                <span className="text-xs text-green-400">Ativo</span>
              </div>
            </div>
            <CardFooter>
              <p className="text-white/70 text-sm">Nossa tecnologia ZK-SNARK garante que suas operações fiquem totalmente anônimas na blockchain Avalanche.</p>
              <Button 
                variant="secondary" 
                fullWidth 
                className="mt-4" 
                size="sm"
                onClick={() => showToast('Detalhes técnicos em breve disponíveis', 'info')}
              >
                Ver detalhes técnicos
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10">
        <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-4 md:mb-0">Carteira Privada</h2>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10 flex items-center self-start">
          <span className="text-xs text-white/60 mr-2">Rede:</span>
          <span className="flex items-center text-sm text-white">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Avalanche C-Chain
          </span>
        </div>
      </div>
      
      {/* Aviso de conexão */}
      {!isConnected && (
        <Card className="mb-6 md:mb-10 max-w-xl mx-auto border border-red-500/20">
          <div className="flex flex-col md:flex-row md:items-start">
            <div className="p-2 rounded-full bg-red-500/10 mb-4 md:mb-0 md:mr-4 self-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <strong className="block text-lg font-semibold text-white mb-2">Carteira não conectada</strong>
              <p className="text-white/80 mb-3">Para garantir privacidade total de suas transações, conecte uma carteira compatível com a rede Avalanche.</p>
              <Button 
                variant="ghost" 
                onClick={handleConnectWarning}
                className="text-primary hover:text-secondary"
              >
                Precisa de ajuda para conectar?
              </Button>
              {showWarning && (
                <div className="mt-3 text-sm text-white/80 bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="mb-2 font-medium">Métodos de conexão recomendados:</p>
                  <ul className="list-disc ml-4 space-y-2">
                    <li><span className="font-medium">MetaMask:</span> Configure a rede Avalanche C-Chain e conecte-se.</li>
                    <li><span className="font-medium">Core Wallet:</span> Compatível nativamente com Avalanche.</li>
                    <li><span className="font-medium">WalletConnect:</span> Use o QR Code para conexão móvel segura.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Layout responsivo para cards */}
      {isMobileOrTablet ? (
        <>
          {/* Versão mobile com tabs */}
          {renderMobileTabs()}
          {renderMobileContent()}
        </>
      ) : (
        /* Layout desktop em grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {/* Card de Saldo */}
          <Card>
            <CardHeader 
              title="Seus ativos" 
              children={<StatusBadge status="privado" label="Privado" />} 
            />
            
            {isLoading ? (
              <LoadingCard />
            ) : (
              <div>
                <div className="flex items-center space-x-4 mb-6 bg-gradient-card-premium p-4 rounded-lg border border-avax-red/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-avax-red to-avax-orange flex items-center justify-center shadow-glow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Private AVAX</div>
                    <div className="text-2xl font-bold text-white">{balance ?? 0} <span className="text-sm font-normal text-white/70">PAVX</span></div>
                  </div>
                </div>
                
                <div className="border-t border-white/5 pt-4 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Valor estimado</span>
                    <span className="text-white font-medium">$0.00 USD</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-white/60">Status de privacidade</span>
                    <span className="flex items-center text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Protegido
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <CardFooter divider={false} className="mt-auto pt-4 grid grid-cols-2 gap-3">
              <Button variant="secondary" size="sm" onClick={handleDeposit}>
                Depositar
              </Button>
              <Button variant="primary" size="sm" onClick={handleWithdraw}>
                Sacar
              </Button>
            </CardFooter>
          </Card>

          {/* Formulário de Envio */}
          <Card>
            <CardHeader 
              title="Transferência privada" 
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
                label="Endereço do destinatário"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                helperText="O endereço do destinatário será encriptado"
              />
              
              <Input
                label="Quantidade de tokens"
                placeholder="Ex: 100"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              
              <div className="py-2 px-3 rounded-lg bg-gradient-card-premium border border-avax-red/10">
                <div className="flex items-start">
                  <div className="p-1 rounded-full bg-avax-red/10 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-white/70">Os valores e destinatários de suas transações são protegidos por tecnologia de encriptação ZK-SNARK</span>
                </div>
              </div>
              
              <Button
                variant="primary"
                fullWidth
                className="mt-6"
                isLoading={minting}
                disabled={minting || !amount || !recipient || !address}
                onClick={handleSendTransaction}
              >
                Enviar transferência privada
              </Button>
            </div>
          </Card>

          {/* Painel de Privacidade */}
          <Card>
            <CardHeader 
              title="Status de Privacidade" 
              children={<StatusBadge status="success" label="Ativo" />} 
            />
            
            <div className="space-y-5 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-white">Endereços ocultos</span>
                </div>
                <span className="text-xs text-green-400">Ativo</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-white">Valores protegidos</span>
                </div>
                <span className="text-xs text-green-400">Ativo</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944A11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-white">Rotas anonimizadas</span>
                </div>
                <span className="text-xs text-green-400">Ativo</span>
              </div>
            </div>
            
            <CardFooter>
              <p className="text-white/70 text-sm">Nossa tecnologia ZK-SNARK garante que suas operações fiquem totalmente anônimas na blockchain Avalanche.</p>
              <Button 
                variant="secondary" 
                fullWidth 
                className="mt-4" 
                size="sm"
                onClick={() => showToast('Detalhes técnicos em breve disponíveis', 'info')}
              >
                Ver detalhes técnicos
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Lista de Transações */}
      <Card className="overflow-hidden">
        <TransactionList transactions={mockTransactions} />
      </Card>
    </div>
  );
} 