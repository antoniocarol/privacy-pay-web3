import { useState, useEffect, useCallback } from 'react';

interface StorageItem<T> {
  value: T;
  expiry?: number;
}

/**
 * Hook personalizado para gerenciar dados no localStorage com opção de expiração
 * @param key Chave para armazenar no localStorage
 * @param initialValue Valor inicial
 * @param expiryInMinutes Tempo de expiração em minutos (opcional)
 * @returns Estado e funções para manipular o valor
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  expiryInMinutes?: number
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Função para obter o valor do localStorage
  const readValue = useCallback((): T => {
    // Previne erro em SSR
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      if (item) {
        const parsedItem: StorageItem<T> = JSON.parse(item);
        
        // Verifica se o item expirou
        if (parsedItem.expiry && parsedItem.expiry < new Date().getTime()) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
        
        return parsedItem.value;
      }
      
      return initialValue;
    } catch (error) {
      console.warn(`Erro ao ler do localStorage para a chave "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);
  
  // Estado para armazenar o valor atual
  const [storedValue, setStoredValue] = useState<T>(readValue);
  
  // Função para persistir o valor no localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Permite valor como função (igual ao setState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salva o state
      setStoredValue(valueToStore);
      
      // Previne erro em SSR
      if (typeof window !== 'undefined') {
        const item: StorageItem<T> = {
          value: valueToStore
        };
        
        // Adiciona expiração se definida
        if (expiryInMinutes) {
          const expiryTime = new Date().getTime() + expiryInMinutes * 60 * 1000;
          item.expiry = expiryTime;
        }
        
        window.localStorage.setItem(key, JSON.stringify(item));
      }
    } catch (error) {
      console.warn(`Erro ao salvar no localStorage para a chave "${key}":`, error);
    }
  }, [key, storedValue, expiryInMinutes]);
  
  // Função para remover o item do localStorage
  const removeValue = useCallback(() => {
    try {
      // Previne erro em SSR
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Erro ao remover do localStorage para a chave "${key}":`, error);
    }
  }, [initialValue, key]);
  
  // Sincroniza valor com outros componentes que usam o mesmo hook
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue: StorageItem<T> = JSON.parse(e.newValue);
          setStoredValue(newValue.value);
        } catch {
          setStoredValue(initialValue);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [initialValue, key]);
  
  return [storedValue, setValue, removeValue];
} 