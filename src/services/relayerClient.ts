// src/services/relayerClient.ts
import axios from 'axios';

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL || 'http://localhost:3001';

export async function postPrivateTransfer(body: {
  nullifier: string;
  newCommitment: string;
  converterAddress: string;
}) {
  const { data } = await axios.post(`${RELAYER_URL}/privateTransfer`, body);
  return data.hash as `0x${string}`;
}

export async function postSendEncryptedNote(body: {
  recipientWalletAddress: string;
  encryptedNotePayload: string;
  commitmentForRecipient: string;
  nullifierToSpend: string;
  converterAddress: string;
}) {
  const { data } = await axios.post(`${RELAYER_URL}/sendEncryptedNote`, body);
  return data.hash as `0x${string}`;
}

export interface EncryptedNoteResponse {
  commitment: string;
  encryptedData: string;
}

export async function getEncryptedNotes(userWalletAddress: string): Promise<EncryptedNoteResponse[]> {
  const { data } = await axios.get(`${RELAYER_URL}/getEncryptedNotes`, {
    params: { userWalletAddress }
  });
  return (data.notes || []) as EncryptedNoteResponse[];
}

export async function postUnshield(body: {
  nullifier: string;
  recipient: string;
  amount: string; // em string para BigInt
  converterAddress: string;
}) {
  const { data } = await axios.post(`${RELAYER_URL}/unshield`, body);
  return data.hash as `0x${string}`;
}
