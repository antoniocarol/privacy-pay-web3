import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Hook otimizado para detectar media queries usando useSyncExternalStore
 * @param query Media query a ser verificada (ex: '(max-width: 768px)')
 * @returns Boolean indicando se a query atual corresponde
 */
export function useMediaQuery(query: string): boolean {
  // Criando uma função memoizada para assinar mudanças na media query
  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === 'undefined') {
      return () => {};
    }
    
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', callback);
    
    return () => mediaQuery.removeEventListener('change', callback);
  }, [query]);

  // Função para pegar o snapshot do estado atual
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  }, [query]);

  // Valor de fallback para SSR
  const getServerSnapshot = useCallback(() => false, []);

  // Usando o hook do React 18 para sincronizar com fonte externa de dados
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Valores memoizados para as queries mais comuns
const MOBILE_QUERY = '(max-width: 767px)';
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)';
const DESKTOP_QUERY = '(min-width: 1024px)';
const MOBILE_OR_TABLET_QUERY = '(max-width: 1023px)';

// Hooks pré-configurados para tamanhos comuns de tela
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}

export function useIsTablet(): boolean {
  return useMediaQuery(TABLET_QUERY);
}

export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}

export function useIsMobileOrTablet(): boolean {
  return useMediaQuery(MOBILE_OR_TABLET_QUERY);
} 