import { useAccount } from 'wagmi';
import { Card, CardHeader } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { useState } from 'react';
import { PrivacyTransactionForm } from '../components/PrivacyTransactionForm';
import { PrivateNotes } from '../components/PrivateNotes';
import { useEERC20 } from '../hooks/useEERC20';
import { TransactionList } from '../components/TransactionList';
import { useToast } from '../providers/ToastProvider';

// Transações de exemplo para demonstração
const DEMO_TRANSACTIONS = [
  {
    id: 'tx1',
    type: 'Shield',
    value: 50,
    status: 'Confirmada',
    hash: '0x6fd7...e3c1',
    date: '2024-06-15'
  },
  {
    id: 'tx2',
    type: 'Privada',
    value: 25,
    status: 'Privado',
    hash: '0xa28f...b91d',
    date: '2024-06-14'
  },
  {
    id: 'tx3',
    type: 'Unshield',
    value: 10,
    status: 'Pendente',
    hash: '0x72e1...f43a',
    date: '2024-06-13'
  }
];

export function PrivacyDashboard() {
  const { isConnected, address } = useAccount();
  const { privateBalance } = useEERC20();
  const { showToast } = useToast();
  
  const [showZkpDetails, setShowZkpDetails] = useState(false);
  
  // Handler para mostrar detalhes ZKP
  const handleShowZkpDetails = () => {
    setShowZkpDetails(true);
    showToast('Informações ZKP disponibilizadas para visualização.', 'info');
  };
  
  return (
    <div className="py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 md:mb-0">
          Privacy<span className="text-primary">Pay</span>
        </h1>
        
        <div className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10 flex items-center">
          <span className="text-xs text-white/60 mr-2">Rede:</span>
          <span className="flex items-center text-sm text-white">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Avalanche Fuji
          </span>
        </div>
      </div>

      {!isConnected ? (
        <Card className="mb-8 max-w-2xl mx-auto border border-red-500/20">
          <div className="flex flex-col md:flex-row md:items-start">
            <div className="p-2 rounded-full bg-red-500/10 mb-4 md:mb-0 md:mr-4 self-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <strong className="block text-lg font-semibold text-white mb-3">Conecte sua carteira</strong>
              <p className="text-white/80 mb-5">
                Para utilizar a PrivacyPay, você precisa conectar uma carteira compatível com a Avalanche C-Chain. 
                Suas transações serão completamente anônimas e privadas.
              </p>
              <appkit-button />
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Visão geral dos saldos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="col-span-1">
              <CardHeader 
                title="Saldo Privado" 
                children={<StatusBadge status="privado" label="Privado" />} 
              />
              
              <div className="flex items-center space-x-4 mb-6 bg-gradient-card-premium p-4 rounded-lg border border-avax-red/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-avax-red to-avax-orange flex items-center justify-center shadow-glow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-white/70 mb-1">Saldo Anônimo</div>
                  <div className="text-2xl font-bold text-white">{privateBalance || '0'} <span className="text-sm font-normal text-white/70">PAVX</span></div>
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Endereço</span>
                  <span className="font-mono text-white/80">{address?.substring(0, 6)}...{address?.substring(address.length - 4)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Status de privacidade</span>
                  <span className="flex items-center text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Protegido
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">ZK-SNARK status</span>
                  <button
                    onClick={handleShowZkpDetails}
                    className="text-xs text-primary hover:underline"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            </Card>

            {/* Formulário de transação privada */}
            <div className="col-span-1 md:col-span-2">
              <PrivacyTransactionForm />
            </div>
          </div>

          {/* Notas privadas e transações */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="col-span-1">
              <PrivateNotes />
            </div>
            
            <div className="col-span-1 lg:col-span-2">
              <Card className="overflow-hidden">
                <TransactionList
                  transactions={DEMO_TRANSACTIONS}
                  tokenSymbol="PAVX"
                />
              </Card>
            </div>
          </div>

          {/* Detalhes técnicos da privacidade */}
          {showZkpDetails && (
            <Card className="mb-8">
              <CardHeader title="Detalhes Técnicos de Privacidade" />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-2">Como funciona o protocolo eERC20</h3>
                  <p className="text-sm text-white/70">
                    O protocolo eERC20 da Avalanche implementa transações confidenciais usando provas de conhecimento-zero (ZK-SNARK). 
                    Cada transação cria um commitment que ofusca o valor e os participantes, mas permite verificar a validade da operação.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="text-primary font-medium mb-2">Shield</h4>
                    <p className="text-xs text-white/70">
                      Converte tokens públicos em commitments confidenciais, semelhante a um depósito privado.
                    </p>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="text-primary font-medium mb-2">Transferência privada</h4>
                    <p className="text-xs text-white/70">
                      Permite transferir tokens entre usuários sem revelar quantidades ou endereços na blockchain.
                    </p>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <h4 className="text-primary font-medium mb-2">Unshield</h4>
                    <p className="text-xs text-white/70">
                      Converte tokens privados de volta para o formato público, similar a um saque.
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-4 mt-6">
                  <h3 className="text-white font-medium mb-2">Segurança dos seus dados</h3>
                  <ul className="text-sm text-white/70 space-y-2">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>As notas privadas são armazenadas localmente em seu navegador com criptografia forte.</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Apenas você pode acessar seus próprios fundos privados.</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Recomendamos exportar e fazer backup de suas chaves de visualização para evitar perda de acesso.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-white/10 pt-4 mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open('https://docs.avax.network/build/subnet/encrypted-transactions/use-encrypted-transactions', '_blank')}
                  >
                    Documentação Avalanche eERC20
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 