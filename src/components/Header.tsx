import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

export function Header() {
  const { address } = useAccount();
  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-5)}` : '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { title: 'Dashboard', path: '/' },
    { title: 'Transações', path: '/transactions' },
    { title: 'Privacidade', path: '/privacy' },
    { title: 'Admin', path: '/admin' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-darkblue/90 border-b border-white/10 py-4 px-6 shadow-md">
      <div className="container mx-auto max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-gradient-btn flex items-center justify-center shadow-glow">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <div className="ml-3 flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight">PrivacyPay</span>
            <span className="text-xs text-white/50">Powered by Avalanche</span>
          </div>
        </div>
        
        {/* Navegação - Desktop */}
        <nav className="hidden md:flex items-center space-x-10">
          {menuItems.map(item => (
            <Link 
              key={item.path}
              to={item.path} 
              className="text-white/90 hover:text-white transition-colors font-medium tracking-wide text-sm"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        
        {/* Wallet Info */}
        <div className="flex items-center space-x-4">
          {address && !isMobile && (
            <div className="hidden md:flex items-center space-x-3 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#E84142] to-[#FF9B45] flex items-center justify-center">
                <span className="text-xs text-white">A</span>
              </div>
              <span className="text-white/90 text-sm font-medium">{truncatedAddress}</span>
            </div>
          )}
          <appkit-button />
          
          {/* Botão de menu mobile */}
          <button 
            className="md:hidden p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 bg-darkblue border-b border-white/10 shadow-lg animate-slide-in">
          <div className="container mx-auto py-2 px-6">
            <nav className="flex flex-col space-y-3 py-4">
              {menuItems.map(item => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className="text-white/90 hover:text-white transition-colors py-2 px-3 font-medium rounded-lg hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              
              {address && (
                <div className="mt-2 pt-4 border-t border-white/10 flex items-center space-x-3">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#E84142] to-[#FF9B45] flex items-center justify-center">
                    <span className="text-xs text-white">A</span>
                  </div>
                  <span className="text-white/90 text-sm font-medium">{truncatedAddress}</span>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 