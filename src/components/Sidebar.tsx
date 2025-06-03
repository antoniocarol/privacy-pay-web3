import { NavLink } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="fixed left-0 bottom-0 md:top-[72px] w-full md:w-[72px] lg:w-[240px] bg-darkblue/80 backdrop-blur-lg border-t md:border-t-0 md:border-r border-white/10 z-[100] flex flex-col h-[72px] md:h-[calc(100vh-72px)]">
      {/* Logo */}
      <div className="flex items-center justify-center md:justify-start w-full mb-10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">S</span>
        </div>
        <span className="hidden md:block text-xl font-bold text-white ml-3">SecretPoints</span>
      </div>
      
      {/* Navegação */}
      <nav className="flex md:flex-col items-center justify-around md:justify-start md:space-y-1 md:p-2 h-full">
        <NavLink to="/" className={({ isActive }) =>
          `flex items-center py-3 px-3 rounded-lg transition-all ${
            isActive 
              ? 'bg-white/10 text-white font-medium' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`
        }>
          <span className="text-xl md:text-base flex items-center justify-center md:justify-start w-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="hidden md:inline">Dashboard</span>
          </span>
        </NavLink>
        
        <NavLink to="/admin" className={({ isActive }) =>
          `flex items-center py-3 px-3 rounded-lg transition-all ${
            isActive 
              ? 'bg-white/10 text-white font-medium' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`
        }>
          <span className="text-xl md:text-base flex items-center justify-center md:justify-start w-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            <span className="hidden md:inline">Admin</span>
          </span>
        </NavLink>
      </nav>
      
      {/* Wallet */}
      <div className="mt-auto w-full flex justify-center md:justify-start px-2">
        <w3m-button />
      </div>
    </aside>
  );
} 