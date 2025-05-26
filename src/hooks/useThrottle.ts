import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook personalizado para limitar a frequência de execução de uma função (throttle)
 * @param callback Função que será limitada
 * @param delay Tempo em ms entre execuções permitidas
 * @returns Função limitada
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  // Refs para armazenar estado entre renderizações
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastExecutedRef = useRef<number>(0);
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
  
  // Retorna a função throttled
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const elapsed = now - lastExecutedRef.current;
      
      // Limpa qualquer timeout pendente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Se já passou tempo suficiente desde a última execução, executa imediatamente
      if (elapsed >= delay) {
        lastExecutedRef.current = now;
        callbackRef.current(...args);
      } else {
        // Caso contrário, agenda para executar após o tempo restante
        timeoutRef.current = setTimeout(() => {
          lastExecutedRef.current = Date.now();
          callbackRef.current(...args);
          timeoutRef.current = null;
        }, delay - elapsed);
      }
    },
    [delay]
  );
} 