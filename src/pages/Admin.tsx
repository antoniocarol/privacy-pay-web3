import { useAccount } from 'wagmi';
import { useSecretPoints } from '@/hooks/useSecretPoints';

export function Admin() {
  const { address } = useAccount();
  const { data: balance, isLoading } = useSecretPoints();

  return (
    <div className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight text-center">Admin</h1>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 max-w-xl mx-auto overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Informações da Wallet</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-white/70 font-medium mb-2">Endereço</h3>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-3">
                <span className="text-white font-mono text-sm break-all select-all">
                  {address || 'Não conectado'}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-white/70 font-medium mb-2">Saldo</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">SP</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-white/70">Secret Points</p>
                    <p className="text-xl font-bold text-white">
                      {isLoading ? 'Carregando...' : balance ?? 0}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Ativo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 px-8 py-4 border-t border-white/10">
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg shadow hover:shadow-md hover:scale-[1.02] transition-all">
              Gerenciar Pontos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 