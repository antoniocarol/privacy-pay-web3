import * as nacl from 'tweetnacl-ts';
import { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

const ENCRYPTION_PUBLIC_KEY_LS = 'privacyPayEncryptionPublicKey';
const ENCRYPTION_SECRET_KEY_LS = 'privacyPayEncryptionSecretKey';

interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

/**
 * Gera um novo par de chaves para nacl.box (usado para sealedBox open).
 */
function generateKeys(): KeyPair {
  return nacl.box_keyPair();
}

/**
 * Garante que o usuário tenha um par de chaves de encriptação, gerando-o se necessário,
 * e armazena no localStorage.
 */
function ensureEncryptionKeys(): KeyPair {
  let publicKeyBase64 = localStorage.getItem(ENCRYPTION_PUBLIC_KEY_LS);
  let secretKeyBase64 = localStorage.getItem(ENCRYPTION_SECRET_KEY_LS);

  if (publicKeyBase64 && secretKeyBase64) {
    try {
      return {
        publicKey: decodeBase64(publicKeyBase64),
        secretKey: decodeBase64(secretKeyBase64),
      };
    } catch (e) {
      console.error("Erro ao decodificar chaves do localStorage, gerando novas:", e);
      // Se houver erro na decodificação, força a geração de novas chaves
      localStorage.removeItem(ENCRYPTION_PUBLIC_KEY_LS);
      localStorage.removeItem(ENCRYPTION_SECRET_KEY_LS);
    }
  }

  const newKeys = generateKeys();
  localStorage.setItem(ENCRYPTION_PUBLIC_KEY_LS, encodeBase64(newKeys.publicKey));
  localStorage.setItem(ENCRYPTION_SECRET_KEY_LS, encodeBase64(newKeys.secretKey));
  return newKeys;
}

/**
 * Retorna a chave pública de encriptação do usuário atual (Base64) ou null se não existir.
 * Garante a criação das chaves se não existirem.
 */
export function getOwnEncryptionPublicKeyBase64(): string | null {
  const keys = ensureEncryptionKeys();
  return encodeBase64(keys.publicKey);
}

/**
 * Retorna a chave secreta de encriptação (para decriptação) do usuário atual ou null.
 * Garante a criação das chaves se não existirem.
 */
function getOwnEncryptionKeys(): KeyPair | null {
  return ensureEncryptionKeys(); // Sempre retorna um KeyPair ou lança erro dentro de ensureEncryptionKeys
}


/**
 * Encripta dados usando a chave pública do destinatário (sealed box).
 * @param dataToEncrypt Objeto a ser encriptado.
 * @param recipientPublicKeyBase64 Chave pública (box) do destinatário em Base64.
 * @returns String Base64 da mensagem encriptada, ou null em caso de erro.
 */
export function encryptDataForRecipient(dataToEncrypt: object, recipientPublicKeyBase64: string): string | null {
  try {
    const messageUint8Array = decodeUTF8(JSON.stringify(dataToEncrypt));
    const recipientPublicKeyUint8Array = decodeBase64(recipientPublicKeyBase64);
    
    // Sealed box não requer a chave privada do remetente para encriptar, apenas a pública do destinatário.
    const encryptedMessage = nacl.sealedbox(messageUint8Array, recipientPublicKeyUint8Array);
    return encodeBase64(encryptedMessage);
  } catch (e) {
    console.error("Erro ao encriptar dados (sealed box):", e);
    return null;
  }
}

/**
 * Decripta dados que foram encriptados com sealed box usando o par de chaves do usuário atual.
 * @param encryptedDataBase64 Dados encriptados em Base64.
 * @returns Objeto decriptado, ou null se a decriptação falhar.
 */
export function decryptSealedBoxData(encryptedDataBase64: string): object | null {
  const ownKeys = getOwnEncryptionKeys();
  if (!ownKeys) {
    console.error("Não foi possível obter as chaves de decriptação do usuário.");
    return null;
  }

  try {
    const encryptedDataUint8Array = decodeBase64(encryptedDataBase64);
    const decryptedMessageUint8Array = nacl.sealedbox_open(
      encryptedDataUint8Array,
      ownKeys.publicKey, // Chave pública do próprio usuário
      ownKeys.secretKey  // Chave secreta do próprio usuário
    );

    if (decryptedMessageUint8Array) {
      return JSON.parse(encodeUTF8(decryptedMessageUint8Array));
    }
    console.warn("Falha ao decriptar dados (sealed box open retornou null).");
    return null;
  } catch (e) {
    console.error("Erro ao decriptar dados (sealed box open):", e);
    return null;
  }
}

// Para garantir que as chaves sejam geradas na primeira carga, se necessário.
ensureEncryptionKeys(); 