// Importando apenas os módulos necessários
import { AES, enc, lib, HmacSHA256, PBKDF2 } from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

// Constantes para configuração de segurança
const PBKDF2_ITERATIONS = 10000;
const SALT_SIZE = 16;
const KEY_SIZE = 256 / 32;
const IV_SIZE = 128 / 32;

/**
 * Classe utilitária para operações criptográficas do PrivacyPay
 * Implementa métodos para criptografia/descriptografia e operações ZK relacionadas
 */
class CryptoService {
  /**
   * Encripta um texto com chave derivada forte
   * @param text Texto a ser encriptado (ex: saldo, valor de transação)
   * @param key Chave de acesso (normalmente endereço da carteira)
   * @returns String encriptada com dados para descriptografia
   */
  encrypt(text: string, key: string): string {
    try {
      // Gera um salt aleatório para PBKDF2
      const salt = lib.WordArray.random(SALT_SIZE);
      
      // Deriva uma chave forte do endereço da carteira usando PBKDF2
      const derivedKey = PBKDF2(key, salt, {
        keySize: KEY_SIZE,
        iterations: PBKDF2_ITERATIONS
      });
      
      // Gera um IV aleatório para cada encriptação
      const iv = lib.WordArray.random(IV_SIZE);
      
      // Encripta usando AES com a chave derivada
      const encrypted = AES.encrypt(text, derivedKey.toString(), { 
        iv: iv
      });
      
      // Combina salt, iv e o texto encriptado para armazenamento
      const result = salt.toString() + 
                    iv.toString() + 
                    encrypted.toString();
                    
      return result;
    } catch (error) {
      console.error('Erro de encriptação:', error);
      throw new Error('Falha na encriptação de dados');
    }
  }
  
  /**
   * Decripta um texto previamente encriptado
   * @param encryptedData Texto encriptado (formato salt+iv+ciphertext)
   * @param key Chave de acesso (normalmente endereço da carteira)
   * @returns Texto descriptografado ou string vazia em caso de falha
   */
  decrypt(encryptedData: string, key: string): string {
    try {
      // Extrai o salt (primeiros 32 caracteres em hex = 16 bytes)
      const salt = enc.Hex.parse(encryptedData.substring(0, 32));
      // Extrai o IV (próximos 32 caracteres em hex = 16 bytes)
      const iv = enc.Hex.parse(encryptedData.substring(32, 64));
      // O resto é o texto encriptado
      const encrypted = encryptedData.substring(64);
      
      // Deriva a mesma chave usando PBKDF2 com o salt extraído
      const derivedKey = PBKDF2(key, salt, {
        keySize: KEY_SIZE,
        iterations: PBKDF2_ITERATIONS
      });
      
      // Decripta usando as mesmas configurações
      const decrypted = AES.decrypt(encrypted, derivedKey.toString(), {
        iv: iv
      });
      
      return decrypted.toString(enc.Utf8);
    } catch (error) {
      console.error('Erro de descriptografia:', error);
      return '';
    }
  }
  
  /**
   * Gera um commitment para operação de shield no padrão eERC20
   * @param amount Valor a ser protegido
   * @param userAddress Endereço do usuário
   * @returns Objeto com o commitment e segredos necessários para gastar depois
   */
  generateShieldCommitment(amount: string, userAddress: string): {
    commitment: string;
    nullifier: string;
    secret: string;
  } {
    // Gera um nullifier único (usado para gastar o valor depois)
    const nullifier = HmacSHA256(uuidv4(), userAddress).toString();
    
    // Gera um segredo que só o dono conhecerá
    const secret = HmacSHA256(uuidv4(), nullifier).toString();
    
    // Combina os valores para gerar o commitment (exemplo simplificado)
    // Na implementação real, seria usado Poseidon hash ou outro algoritmo ZK-friendly
    const preimage = `${nullifier}:${secret}:${amount}`;
    const commitment = HmacSHA256(preimage, userAddress).toString();
    
    return {
      commitment,
      nullifier,
      secret
    };
  }
  
  /**
   * Gera dados para uma transação privada
   * @param nullifier Nullifier da operação de shield anterior
   * @param secret Segredo da operação de shield anterior
   * @param amount Valor a ser transferido
   * @param recipientAddress Destinatário (opcional para aumentar privacidade)
   * @returns Dados para transação privada
   */
  createPrivateTransferData(
    nullifier: string, 
    secret: string, 
    amount: string,
    recipientAddress?: string
  ): {
    newCommitment: string;
    transferData: string;
  } {
    // Em uma implementação real, aqui seriam criados os parâmetros para ZK-SNARK
    // com estrutura mais complexa conforme o protocolo da Avalanche
    
    // Cria um novo commitment para o destinatário (simplificado)
    const newSecret = HmacSHA256(uuidv4(), secret).toString();
    const newNullifier = HmacSHA256(uuidv4(), nullifier).toString();
    
    // Destinatário é opcional no protocolo de privacidade
    const recipient = recipientAddress || 'private';
    
    const preimage = `${newNullifier}:${newSecret}:${amount}:${recipient}`;
    const newCommitment = HmacSHA256(preimage, nullifier).toString();
    
    // Encripta os dados da transferência para o sistema de relayer
    const transferData = this.encrypt(
      JSON.stringify({
        nullifier,
        secret,
        newCommitment,
        amount,
        recipient
      }),
      nullifier
    );
    
    return {
      newCommitment,
      transferData
    };
  }
}

// Exporta uma instância singleton do serviço
export const cryptoService = new CryptoService();

// Mantém as funções originais para compatibilidade
export const encrypt = (text: string, key: string): string => {
  return cryptoService.encrypt(text, key);
};

export const decrypt = (encryptedData: string, key: string): string => {
  return cryptoService.decrypt(encryptedData, key);
}; 