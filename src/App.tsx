import { Header } from './components/Header';
import { Outlet } from 'react-router-dom';
import './index.css';

export default function App() {
  // Função para conectar carteira (substitua pelo seu handler real)
  const handleConnect = () => {
    // lógica de conexão
  };

  return (
    <div className="min-h-screen w-full font-sans text-white overflow-x-hidden bg-gradient-to-br from-darkblue via-[#131740] to-[#171735]">
      <div className="fixed inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none"></div>
      <Header />
      
      <div className="relative z-10 flex-1 pt-20">
        <main className="container mx-auto px-4 md:px-8 lg:px-16 py-6 max-w-7xl">
          <Outlet />
        </main>
        
        <footer className="mt-16 border-t border-white/5 py-8">
          <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-8 h-8 rounded-full bg-gradient-btn flex items-center justify-center shadow-glow">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <span className="ml-2 text-sm font-medium text-white">PrivacyPay</span>
              </div>
              <div className="text-center md:text-right">
                <p className="text-xs text-white/50">Todos os direitos reservados © 2024 PrivacyPay</p>
                <p className="text-xs text-white/50 mt-1">Construído na rede Avalanche</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
