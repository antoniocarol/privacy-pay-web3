import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook personalizado para atrasar a execução de uma função até que uma pausa na invocação ocorra (debounce)
 * @param callback Função que será atrasada
 * @param delay Tempo em ms para esperar antes de executar
 * @returns Função com debounce aplicado
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  // Ref para armazenar o timeout entre renderizações
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef<T>(callback);
  
  // Atualiza o callback quando ele mudar
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Limpa o timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Retorna a função com debounce
  return useCallback(
    (...args: Parameters<T>) => {
      // Cancela qualquer timeout pendente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Agenda uma nova execução após o delay
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [delay]
  );
} 