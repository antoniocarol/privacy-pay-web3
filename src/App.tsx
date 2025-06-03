import { Header } from './components/Header';
import { Outlet, useLocation } from 'react-router-dom';
import './index.css';
import { useState, useEffect } from 'react';
import Home from './pages/Home'; // Importar a Home page

export default function App() {
  const [viewMode, setViewMode] = useState<'home' | 'dashboard'>('home');
  const location = useLocation();

  // Determinar o modo de visualização inicial com base na rota
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard') || 
        location.pathname.startsWith('/transactions') || 
        location.pathname.startsWith('/admin')) {
      setViewMode('dashboard');
    } else {
      setViewMode('home');
    }
  }, [location.pathname]);

  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'home' ? 'dashboard' : 'home');
    // Para uma transição suave, idealmente o scroll seria para o topo.
    window.scrollTo(0, 0);
  };

  // Definição das classes de background baseadas no viewMode
  // TODO: Substituir pelas cores e gradientes finais desejados, incluindo o efeito de ponto focal.
  const dashboardBgClasses = "bg-gradient-to-br from-darkblue via-[#131740] to-[#171735]";
  const homeBgClasses = "bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"; // Um exemplo de fundo escuro para a home, mas diferente
  // const homeBgClasses = "bg-gradient-to-tl from-slate-100 via-gray-200 to-slate-300"; // Exemplo de tema claro

  const currentBgClasses = viewMode === 'home' ? homeBgClasses : dashboardBgClasses;

  return (
    <div className={`min-h-screen w-full font-sans text-white overflow-x-hidden transition-colors duration-700 ease-in-out ${currentBgClasses}`}>
      <div className={`fixed inset-0 bg-[url('/grid-pattern.svg')] pointer-events-none transition-opacity duration-700 ease-in-out ${viewMode === 'home' ? 'opacity-30' : 'opacity-5'}`}></div>
      
      <Header toggleViewMode={toggleViewMode} currentViewMode={viewMode} />
      
      <div className="relative z-10 flex-1 pt-20">
        {/* Conteúdo principal renderizado condicionalmente */}
        {/* TODO: Implementar animações de transição lateral aqui */}
        <main className="container mx-auto px-4 md:px-8 lg:px-16 py-6 max-w-7xl">
          {viewMode === 'home' ? <Home /> : <Outlet />}
        </main>
        
        <footer className="mt-16 border-t border-white/10 py-8">
          <div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-glow transition-all duration-500 ease-in-out ${viewMode === 'home' ? 'bg-slate-700' : 'bg-gradient-btn'}`}>
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
