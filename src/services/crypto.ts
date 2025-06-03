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
    // Usar userAddress como parte do salt para o nullifier e secret o torna mais único por usuário
    const nullifierSalt = `${userAddress}-${uuidv4()}`;
    const nullifier = HmacSHA256(uuidv4(), nullifierSalt).toString();
    
    // Gera um segredo que só o dono conhecerá
    const secretSalt = `${nullifier}-${uuidv4()}`;
    const secret = HmacSHA256(uuidv4(), secretSalt).toString();
    
    // Combina os valores para gerar o commitment
    const preimage = `${nullifier}:${secret}:${amount}`;
    // Usar um salt/key diferente para o commitment, pode ser o próprio endereço ou um derivado
    const commitment = HmacSHA256(preimage, userAddress).toString(); // userAddress como "key" para o Hmac
    
    return {
      commitment: `0x${commitment}`,
      nullifier: `0x${nullifier}`,
      secret: `0x${secret}`
    };
  }
  
  /**
   * Gera dados para uma transação privada
   * @param originalNote Objeto contendo nullifier, secret e amount da nota original
   * @param transferAmount Valor a ser transferido
   * @param recipientAddress Endereço do destinatário real
   * @returns Objeto contendo dados para a nota do destinatário e dados da nota de troco
   */
  createPrivateTransferData(
    originalNote: { nullifier: string; secret: string; amount: string; userAddress: string },
    transferAmount: string,
    recipientAddress: string // Endereço do destinatário real
  ): {
    nullifierToSpend: string;
    commitmentForRecipient: string;
    secretForRecipient: string;
    nullifierForRecipient: string;
    changeNoteData?: { commitment: string; secret: string; nullifier: string; amount: string };
  } {
    const { nullifier: originalNullifier, secret: originalSecret, amount: originalAmount, userAddress: senderAddress } = originalNote;
    const bnTransferAmount = BigInt(transferAmount);
    const bnOriginalAmount = BigInt(originalAmount);

    if (bnTransferAmount <= 0n) {
      throw new Error("Valor da transferência deve ser positivo.");
    }
    if (bnTransferAmount > bnOriginalAmount) {
      throw new Error("Valor da transferência excede o valor da nota original.");
    }

    // 1. Dados para a nota do Destinatário
    // O destinatário precisa de seu próprio secret e nullifier para sua nova nota.
    // Usamos recipientAddress para derivar os segredos da nota do destinatário.
    const recipientNoteData = this.generateShieldCommitment(transferAmount, recipientAddress);
    
    const commitmentForRecipient = recipientNoteData.commitment;
    const secretForRecipient = recipientNoteData.secret;
    const nullifierForRecipient = recipientNoteData.nullifier; // Este nullifier será usado pelo destinatário para gastar esta nota

    // 2. Dados para a nota de Troco (se houver)
    let changeNoteData: { commitment: string; secret: string; nullifier: string; amount: string } | undefined = undefined;
    const changeAmount = bnOriginalAmount - bnTransferAmount;

    if (changeAmount > 0n) {
      // A nota de troco pertence ao remetente (senderAddress)
      const senderChangeNote = this.generateShieldCommitment(changeAmount.toString(), senderAddress);
      changeNoteData = {
        commitment: senderChangeNote.commitment,
        secret: senderChangeNote.secret,
        nullifier: senderChangeNote.nullifier,
        amount: changeAmount.toString(),
      };
    }

    return {
      nullifierToSpend: originalNullifier, // O nullifier da nota original que está sendo gasta
      commitmentForRecipient,          // O commitment que será registrado no contrato para o destinatário
      secretForRecipient,              // O secret para o destinatário gastar a nota acima (logar por enquanto)
      nullifierForRecipient,           // O nullifier para o destinatário gastar a nota acima (logar por enquanto)
      changeNoteData                   // Dados da nota de troco para o remetente (se houver)
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