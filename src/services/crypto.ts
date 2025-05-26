// Importando apenas os módulos necessários
import { AES, enc } from 'crypto-js';

// Usa AES com chave simples (string)
export const encrypt = (text: string, key: string): string => {
  return AES.encrypt(text, key).toString();
};

export const decrypt = (encryptedData: string, key: string): string => {
  const bytes = AES.decrypt(encryptedData, key);
  return bytes.toString(enc.Utf8);
}; 