import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronDown, Globe, Home, LayoutGrid, LogOut, ExternalLink, X } from 'lucide-react';

interface HeaderProps {
  toggleViewMode: () => void;
  currentViewMode: 'home' | 'dashboard';
}

// Estilos base para botões/links no header podem ser simplificados ou removidos se o dropdown tiver seu próprio estilo.
const headerLinkBaseClass = "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/40";
const headerLinkIdleClass = "text-white/80 hover:text-white hover:bg-white/10";
const headerLinkActiveClass = "text-white bg-white/10";

export function Header({ toggleViewMode, currentViewMode }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { address, isConnected } = useAccount();
  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-5)}` : '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setDesktopMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleToggleView = () => {
    toggleViewMode();
    setDesktopMenuOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleMobileMenuLinkClick = () => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setDesktopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [desktopMenuRef]);

  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen]);

  const menuItems = currentViewMode === 'dashboard' ? [
    { title: t('Visão Geral'), path: '/dashboard', icon: <LayoutGrid size={16} className="mr-2" /> },
    { title: t('Histórico'), path: '/transactions', icon: <Home size={16} className="mr-2" /> },
  ] : [];

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (location.pathname === '/' && path === '/dashboard');
    return `${headerLinkBaseClass} ${isActive ? headerLinkActiveClass : headerLinkIdleClass}`;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDesktopMenu = () => {
    setDesktopMenuOpen(!desktopMenuOpen);
  };

  const dropdownItemClass = "flex items-center w-full px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-md cursor-pointer";

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] backdrop-blur-lg bg-darkblue/80 border-b border-white/10 py-3 px-4 md:px-6 shadow-lg">
      <div className="container mx-auto max-w-7xl flex items-center justify-between h-12">
        {/* Logo */}
        <Link to={currentViewMode === 'dashboard' ? '/dashboard' : '/'} className="flex items-center cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-glow transition-all duration-300 ease-in-out ${currentViewMode === 'home' ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-gradient-btn group-hover:opacity-90'}`}>
            <span className="text-white text-base font-bold">P</span>
          </div>
          <div className="ml-2.5">
            <span className="text-lg font-semibold text-white tracking-tight block leading-tight">{t('PrivacyPay')}</span>
          </div>
        </Link>
        
        {/* Navegação - Desktop (só aparece no modo dashboard) */}
        {currentViewMode === 'dashboard' && !isMobile && (
          <nav className="flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            {menuItems.map(item => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`${getLinkClass(item.path)} tracking-wide flex items-center`}
                onClick={() => window.scrollTo(0,0)}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        )}
        
        {/* Controles do Header Lado Direito */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Botão de Conexão da Carteira - Sempre visível, ajusta o que mostra */}
          <div className="flex items-center">
            <appkit-button />
          </div>

          {/* Dropdown Menu Desktop (Configurações, Idioma, Troca de View) */}
          {!isMobile && (
            <div className="relative" ref={desktopMenuRef}>
              <button
                onClick={toggleDesktopMenu}
                className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                aria-label={t("Configurações e Opções") as string}
              >
                <Settings size={20} />
              </button>
              <AnimatePresence>
                {desktopMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-60 bg-darkblue/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-2 z-50"
                  >
                    <div className="space-y-1">
          <button 
            onClick={handleToggleView}
                        className={dropdownItemClass}
          >
            {currentViewMode === 'home' ? (
                          <><LayoutGrid size={16} className="mr-2.5 text-primary" /> {t('Ver App')}</>
            ) : (
                          <><Home size={16} className="mr-2.5 text-primary" /> {t('Ver Homepage')}</>
            )}
          </button>

                      <div className="pt-1 mt-1 border-t border-white/10">
                        <p className="px-3 py-1.5 text-xs font-semibold text-white/60">{t("Idioma")}</p>
                        <button onClick={() => changeLanguage('pt')} className={`${dropdownItemClass} ${i18n.language === 'pt' ? 'bg-white/10 text-white' : ''}`}>
                          <Globe size={16} className="mr-2.5" /> {t("Português")} {i18n.language === 'pt' && <span className="ml-auto text-primary">✓</span>}
                        </button>
                        <button onClick={() => changeLanguage('en')} className={`${dropdownItemClass} ${i18n.language === 'en' ? 'bg-white/10 text-white' : ''}`}>
                          <Globe size={16} className="mr-2.5" /> {t("Inglês")} {i18n.language === 'en' && <span className="ml-auto text-primary">✓</span>}
                        </button>
                      </div>
                      
                      {isConnected && address && currentViewMode === 'dashboard' && (
                        <div className="pt-1 mt-1 border-t border-white/10">
                           <p className="px-3 py-1.5 text-xs font-semibold text-white/60">{t("Conta")}</p>
                           <div className={`${dropdownItemClass} cursor-default`}>
                             <ExternalLink size={16} className="mr-2.5" />
                             <span className="truncate" title={address}>{truncatedAddress}</span>
                           </div>
                        </div>
                      )}
              </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Botão de menu mobile */}
          {isMobile && (
          <button 
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            onClick={toggleMobileMenu}
            aria-label={t('Menu') as string}
          >
              {mobileMenuOpen ? <X size={22} /> : <Settings size={20} />}
          </button>
          )}
        </div>
      </div>
      
      {/* Menu mobile Overlay e Conteúdo */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[990]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-xs bg-darkblue shadow-2xl z-[999] p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-white">{t("Menu")}</span>
                <button onClick={toggleMobileMenu} className="p-1 text-white/70 hover:text-white rounded-full hover:bg-white/10">
                  <X size={22} />
                </button>
            </div>

              <nav className="flex-grow flex flex-col space-y-2 text-base">
              <button 
                  onClick={() => { handleToggleView(); }}
                  className={`${dropdownItemClass} py-3`}
              >
                {currentViewMode === 'home' ? (
                    <><LayoutGrid size={18} className="mr-3 text-primary" /> {t('Ver App')}</>
                ) : (
                    <><Home size={18} className="mr-3 text-primary" /> {t('Ver Homepage')}</>
                )}
              </button>

              {currentViewMode === 'dashboard' && menuItems.map(item => (
                <Link 
                  key={item.path}
                  to={item.path} 
                    className={`${getLinkClass(item.path)} block w-full text-left py-3 flex items-center`}
                  onClick={handleMobileMenuLinkClick}
                >
                    {item.icon && React.cloneElement(item.icon, { size: 18, className: "mr-3" })}
                  {item.title}
                </Link>
              ))}
              
                <div className="!mt-auto space-y-2 pt-6 border-t border-white/10">
                  <p className="px-3 text-xs font-semibold text-white/60">{t("Idioma")}</p>
                  <button onClick={() => changeLanguage('pt')} className={`${dropdownItemClass} py-3 ${i18n.language === 'pt' ? 'bg-white/10 text-white' : ''}`}>
                    <Globe size={18} className="mr-3" /> {t("Português")} {i18n.language === 'pt' && <span className="ml-auto text-primary">✓</span>}
                  </button>
                  <button onClick={() => changeLanguage('en')} className={`${dropdownItemClass} py-3 ${i18n.language === 'en' ? 'bg-white/10 text-white' : ''}`}>
                    <Globe size={18} className="mr-3" /> {t("Inglês")} {i18n.language === 'en' && <span className="ml-auto text-primary">✓</span>}
                  </button>
                </div>
            </nav>
            </motion.div>
          </>
      )}
      </AnimatePresence>
    </header>
  );
} 